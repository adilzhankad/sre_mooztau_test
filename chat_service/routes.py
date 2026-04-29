from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ChatMessage, ChatParticipant, ChatRoom
from schemas import ChatRoomCreate, ChatRoomOut, MessageCreate, MessageOut

router = APIRouter(tags=["chat"])


# ── Rooms ─────────────────────────────────────────────────────────────────────

@router.get("/chats", response_model=List[ChatRoomOut])
def list_rooms(user_id: int = None, db: Session = Depends(get_db)):
    if user_id:
        # Rooms where the user is a participant
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

    # Add creator + requested participants
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
