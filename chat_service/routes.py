from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from models import ChatMessage, ChatParticipant, ChatRoom, DirectConversation, DirectMessage
from mongo import archive_message, archive_stats, search_archive
from schemas import ChatRoomCreate, ChatRoomOut, MessageCreate, MessageOut, DirectConversationCreate, DirectConversationOut, DirectMessageOut
from ws_manager import manager

router = APIRouter(tags=["chat"])


# ── Rooms ─────────────────────────────────────────────────────────────────────

@router.get("/chats", response_model=List[ChatRoomOut])
def list_rooms(user_id: int = None, db: Session = Depends(get_db)):
    if user_id:
        room_ids = (
            db.query(ChatParticipant.room_id)
            .filter(ChatParticipant.user_id == user_id)
            .subquery()
        )
        return db.query(ChatRoom).filter(ChatRoom.id.in_(room_ids), ChatRoom.is_active == True).all()
    return db.query(ChatRoom).filter(ChatRoom.is_active == True).order_by(ChatRoom.id).all()


@router.post("/chats", response_model=ChatRoomOut, status_code=201)
def create_room(data: ChatRoomCreate, db: Session = Depends(get_db)):
    room = ChatRoom(name=data.name, created_by_user_id=data.created_by_user_id)
    db.add(room)
    db.flush()

    participant_ids = set(data.participant_user_ids) | {data.created_by_user_id}
    for uid in participant_ids:
        db.add(ChatParticipant(room_id=room.id, user_id=uid))

    db.commit()
    db.refresh(room)
    return room


@router.get("/chats/{room_id}", response_model=ChatRoomOut)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.get(ChatRoom, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    return room


@router.delete("/chats/{room_id}", status_code=204)
def close_room(room_id: int, db: Session = Depends(get_db)):
    room = db.get(ChatRoom, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    room.is_active = False
    db.commit()


# ── Messages ──────────────────────────────────────────────────────────────────

@router.get("/chats/{room_id}/messages", response_model=List[MessageOut])
def get_messages(
    room_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    room = db.get(ChatRoom, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.room_id == room_id)
        .order_by(ChatMessage.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/chats/{room_id}/messages", response_model=MessageOut, status_code=201)
def send_message(room_id: int, data: MessageCreate, db: Session = Depends(get_db)):
    room = db.get(ChatRoom, room_id)
    if not room or not room.is_active:
        raise HTTPException(status_code=404, detail="Chat room not found or closed")
    msg = ChatMessage(
        room_id=room_id,
        sender_user_id=data.sender_user_id,
        sender_name=data.sender_name,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    archive_message(
        room_id=room_id,
        sender_user_id=data.sender_user_id,
        sender_name=data.sender_name,
        content=data.content,
        created_at=msg.created_at,
        message_pg_id=msg.id,
    )
    return msg


@router.get("/chats/archive/search")
def search_messages(q: str, limit: int = 50):
    """Full-text search across the MongoDB message archive."""
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    return {"query": q, "results": search_archive(q.strip(), limit=limit)}


@router.get("/chats/archive/stats")
def get_archive_stats():
    """Return archive metrics from MongoDB."""
    return archive_stats()


# ── WebSocket ─────────────────────────────────────────────────────────────────

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    user_id: int = 0,
    user_name: str = "Аноним",
):
    db = SessionLocal()
    try:
        room = db.get(ChatRoom, room_id)
        if not room or not room.is_active:
            await websocket.close(code=4004)
            return

        await manager.connect(room_id, websocket, user_id, user_name)

        # Уведомление о входе
        await manager.broadcast(room_id, {
            "type": "system",
            "text": f"{user_name} вошёл в чат",
            "room_id": room_id,
            "online": manager.online_count(room_id),
        })

        try:
            while True:
                data = await websocket.receive_json()
                content = str(data.get("content", "")).strip()
                if not content:
                    continue

                # Сохраняем в БД
                msg = ChatMessage(
                    room_id=room_id,
                    sender_user_id=user_id,
                    sender_name=user_name,
                    content=content,
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)
                archive_message(
                    room_id=room_id,
                    sender_user_id=user_id,
                    sender_name=user_name,
                    content=content,
                    created_at=msg.created_at,
                    message_pg_id=msg.id,
                )

                # Рассылаем всем в комнате
                await manager.broadcast(room_id, {
                    "type": "message",
                    "id": msg.id,
                    "room_id": room_id,
                    "sender_user_id": user_id,
                    "sender_name": user_name,
                    "content": content,
                    "created_at": msg.created_at.isoformat(),
                })

        except WebSocketDisconnect:
            manager.disconnect(room_id, websocket)
            await manager.broadcast(room_id, {
                "type": "system",
                "text": f"{user_name} вышел из чата",
                "room_id": room_id,
                "online": manager.online_count(room_id),
            })
    finally:
        db.close()


# ── Direct conversations ───────────────────────────────────────────────────────

@router.get("/direct/conversations", response_model=List[DirectConversationOut])
def list_conversations(employee_id: int = None, db: Session = Depends(get_db)):
    """Admin: все диалоги. Сотрудник: свой диалог по employee_id."""
    if employee_id:
        conv = db.query(DirectConversation).filter(DirectConversation.employee_id == employee_id).first()
        return [conv] if conv else []
    return db.query(DirectConversation).order_by(DirectConversation.last_message_at.desc()).all()


@router.post("/direct/conversations", response_model=DirectConversationOut, status_code=201)
def get_or_create_conversation(data: DirectConversationCreate, db: Session = Depends(get_db)):
    """Создаёт диалог при первом сообщении или возвращает существующий."""
    conv = db.query(DirectConversation).filter(DirectConversation.employee_id == data.employee_id).first()
    if not conv:
        conv = DirectConversation(employee_id=data.employee_id, employee_name=data.employee_name)
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv


@router.get("/direct/conversations/{conv_id}/messages", response_model=List[DirectMessageOut])
def get_direct_messages(conv_id: int, limit: int = 100, db: Session = Depends(get_db)):
    conv = db.get(DirectConversation, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return (
        db.query(DirectMessage)
        .filter(DirectMessage.conversation_id == conv_id)
        .order_by(DirectMessage.created_at.asc())
        .limit(limit)
        .all()
    )


# ── Direct WebSocket ───────────────────────────────────────────────────────────

@router.websocket("/ws/direct/{conv_id}")
async def direct_ws(
    websocket: WebSocket,
    conv_id: int,
    user_id: int = 0,
    user_name: str = "Аноним",
):
    db = SessionLocal()
    try:
        conv = db.get(DirectConversation, conv_id)
        if not conv:
            await websocket.close(code=4004)
            return

        ws_key = f"direct_{conv_id}"
        await manager.connect(ws_key, websocket, user_id, user_name)

        try:
            while True:
                data = await websocket.receive_json()
                content = str(data.get("content", "")).strip()
                if not content:
                    continue

                msg = DirectMessage(
                    conversation_id=conv_id,
                    sender_id=user_id,
                    sender_name=user_name,
                    content=content,
                )
                db.add(msg)
                conv.last_message_at = datetime.utcnow()
                db.commit()
                db.refresh(msg)
                archive_message(
                    room_id=0,
                    conversation_id=conv_id,
                    sender_user_id=user_id,
                    sender_name=user_name,
                    content=content,
                    created_at=msg.created_at,
                    message_pg_id=msg.id,
                )

                await manager.broadcast(ws_key, {
                    "type": "message",
                    "id": msg.id,
                    "conversation_id": conv_id,
                    "sender_id": user_id,
                    "sender_name": user_name,
                    "content": content,
                    "created_at": msg.created_at.isoformat(),
                })

        except WebSocketDisconnect:
            manager.disconnect(ws_key, websocket)
    finally:
        db.close()
