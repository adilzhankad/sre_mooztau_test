from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ChatRoomCreate(BaseModel):
    name: str
    created_by_user_id: int
    participant_user_ids: List[int] = []


class ChatRoomOut(BaseModel):
    id: int
    name: str
    created_by_user_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    sender_user_id: int
    sender_name: str = ""
    content: str


class MessageOut(BaseModel):
    id: int
    room_id: int
    sender_user_id: int
    sender_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Direct messaging schemas ───────────────────────────────────────────────────

class DirectConversationCreate(BaseModel):
    employee_id: int
    employee_name: str


class DirectConversationOut(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    created_at: datetime
    last_message_at: datetime

    class Config:
        from_attributes = True


class DirectMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
