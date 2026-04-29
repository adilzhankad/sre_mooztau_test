from collections import defaultdict
from typing import Union
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._rooms: dict[Union[int, str], list[tuple[WebSocket, int, str]]] = defaultdict(list)

    async def connect(self, room_id: Union[int, str], websocket: WebSocket, user_id: int, user_name: str):
        await websocket.accept()
        self._rooms[room_id].append((websocket, user_id, user_name))

    def disconnect(self, room_id: Union[int, str], websocket: WebSocket):
        self._rooms[room_id] = [
            entry for entry in self._rooms[room_id] if entry[0] is not websocket
        ]

    async def broadcast(self, room_id: Union[int, str], message: dict):
        dead = []
        for entry in self._rooms[room_id]:
            ws, _, _ = entry
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(entry)
        for entry in dead:
            self._rooms[room_id].remove(entry)

    def online_count(self, room_id: Union[int, str]) -> int:
        return len(self._rooms[room_id])


manager = ConnectionManager()
