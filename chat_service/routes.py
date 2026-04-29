from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from models import ChatMessage, ChatParticipant, ChatRoom
from schemas import ChatRoomCreate, ChatRoomOut, MessageCreate, MessageOut
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
    return msg


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
