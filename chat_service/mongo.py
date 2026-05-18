"""MongoDB client for chat message archive and full-text search.

Postgres remains the primary store (transactional integrity, foreign keys);
MongoDB receives a parallel copy of every message for archival + search.
"""
import os
from datetime import datetime
from typing import List, Optional

from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from pymongo.collection import Collection
from pymongo.errors import PyMongoError


_client: Optional[MongoClient] = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        host = os.getenv("MONGO_HOST", "mongo")
        port = os.getenv("MONGO_PORT", "27017")
        user = os.getenv("MONGO_USER", "mooztau")
        pwd = os.getenv("MONGO_PASSWORD", "mooztau_pwd")
        uri = f"mongodb://{user}:{pwd}@{host}:{port}/?authSource=admin"
        _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
    return _client


def get_messages_collection() -> Collection:
    client = get_mongo_client()
    db = client[os.getenv("MONGO_DB", "mooztau_chat")]
    return db["message_archive"]


def ensure_indexes() -> None:
    """Idempotent index creation; called on app startup."""
    try:
        coll = get_messages_collection()
        coll.create_index([("room_id", ASCENDING), ("created_at", DESCENDING)])
        coll.create_index([("sender_user_id", ASCENDING)])
        coll.create_index([("content", TEXT)], default_language="russian")
    except PyMongoError:
        # MongoDB unreachable on startup — fail silently, archive will retry per message
        pass


def archive_message(
    room_id: int,
    sender_user_id: int,
    sender_name: str,
    content: str,
    created_at: datetime,
    message_pg_id: Optional[int] = None,
    conversation_id: Optional[int] = None,
) -> bool:
    """Insert a copy into the Mongo archive. Best-effort — never raises."""
    try:
        coll = get_messages_collection()
        coll.insert_one({
            "room_id": room_id,
            "conversation_id": conversation_id,
            "message_pg_id": message_pg_id,
            "sender_user_id": sender_user_id,
            "sender_name": sender_name,
            "content": content,
            "created_at": created_at,
        })
        return True
    except PyMongoError:
        return False


def search_archive(query: str, limit: int = 50) -> List[dict]:
    """Full-text search across archived messages. Returns lightweight dicts."""
    try:
        coll = get_messages_collection()
        cursor = (
            coll.find(
                {"$text": {"$search": query}},
                {"_id": 0, "room_id": 1, "sender_user_id": 1, "sender_name": 1,
                 "content": 1, "created_at": 1, "score": {"$meta": "textScore"}},
            )
            .sort([("score", {"$meta": "textScore"})])
            .limit(limit)
        )
        return [
            {
                "room_id": doc["room_id"],
                "sender_user_id": doc["sender_user_id"],
                "sender_name": doc["sender_name"],
                "content": doc["content"],
                "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
                "score": doc.get("score", 0),
            }
            for doc in cursor
        ]
    except PyMongoError:
        return []


def archive_stats() -> dict:
    """Returns a small summary of the Mongo archive for /chats/archive/stats."""
    try:
        coll = get_messages_collection()
        return {
            "total_messages": coll.estimated_document_count(),
            "mongo_status": "connected",
        }
    except PyMongoError as exc:
        return {"total_messages": 0, "mongo_status": f"error: {exc}"}
