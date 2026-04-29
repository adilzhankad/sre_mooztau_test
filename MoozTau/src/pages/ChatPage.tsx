import { useEffect, useRef, useState } from "react";
import { CHAT_API_URL } from "@/constants";
import { useAuthStore } from "@/stores/auth-store";

const WS_URL = CHAT_API_URL.replace(/^http/, "ws");

interface Room {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface Message {
  id?: number;
  type: "message" | "system";
  sender_user_id?: number;
  sender_name?: string;
  content?: string;
  text?: string;
  created_at?: string;
  online?: number;
}

export function ChatPage() {
  const userId = useAuthStore((s) => s.userId);
  const fullName = useAuthStore((s) => s.fullName ?? "Пользователь");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(0);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Загружаем список комнат
  useEffect(() => {
    fetch(`${CHAT_API_URL}/chats`)
      .then((r) => r.json())
      .then(setRooms)
      .catch(console.error);
  }, []);

  // Подключаемся к комнате по WebSocket
  useEffect(() => {
    if (!activeRoom) return;

    // Загружаем историю
    fetch(`${CHAT_API_URL}/chats/${activeRoom.id}/messages?limit=100`)
      .then((r) => r.json())
      .then((history: Message[]) =>
        setMessages(history.map((m) => ({ ...m, type: "message" })))
      )
      .catch(console.error);

    // WebSocket
    const ws = new WebSocket(
      `${WS_URL}/ws/${activeRoom.id}?user_id=${userId ?? 0}&user_name=${encodeURIComponent(fullName)}`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      if (data.type === "system") {
        setOnline(data.online ?? 0);
        setMessages((prev) => [...prev, data]);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => setOnline(0);

    return () => {
      ws.close();
      wsRef.current = null;
      setMessages([]);
      setOnline(0);
    };
  }, [activeRoom, userId, fullName]);

  // Скролл вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: text }));
    setInput("");
  }

  async function createRoom() {
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${CHAT_API_URL}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName.trim(),
          created_by_user_id: userId ?? 0,
          participant_user_ids: [],
        }),
      });
      const room: Room = await res.json();
      setRooms((prev) => [...prev, room]);
      setNewRoomName("");
      setActiveRoom(room);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "calc(100vh - 56px)", background: "var(--bg)" }}>
      {/* Sidebar — список комнат */}
      <aside style={{ borderRight: "1px solid var(--border)", display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>
            Чат-комнаты
          </p>
        </div>

        <div style={{ overflowY: "auto" }}>
          {rooms.length === 0 && (
            <p style={{ padding: "16px 14px", margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Нет комнат
            </p>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                border: "none",
                background: activeRoom?.id === room.id ? "var(--primary-soft, #eff6ff)" : "transparent",
                borderLeft: activeRoom?.id === room.id ? "3px solid var(--primary, #2563eb)" : "3px solid transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeRoom?.id === room.id ? 700 : 400,
                color: "var(--text-default)",
              }}
            >
              # {room.name}
            </button>
          ))}
        </div>

        {/* Создать комнату */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "grid", gap: 6 }}>
          <input
            className="input"
            placeholder="Название комнаты"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void createRoom()}
            style={{ fontSize: 13 }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => void createRoom()}
            disabled={creating || !newRoomName.trim()}
          >
            + Создать
          </button>
        </div>
      </aside>

      {/* Основная область */}
      {activeRoom ? (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", overflow: "hidden" }}>
          {/* Заголовок */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}># {activeRoom.name}</p>
            </div>
            {online > 0 && (
              <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                ● {online} онлайн
              </span>
            )}
          </div>

          {/* Сообщения */}
          <div style={{ overflowY: "auto", padding: "12px 16px", display: "grid", alignContent: "start", gap: 8 }}>
            {messages.map((msg, i) =>
              msg.type === "system" ? (
                <p key={i} style={{ margin: 0, textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}>
                  {msg.text}
                </p>
              ) : (
                <div
                  key={msg.id ?? i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender_user_id === (userId ?? 0) ? "flex-end" : "flex-start",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
                    {msg.sender_name}
                  </span>
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "8px 12px",
                      borderRadius: msg.sender_user_id === (userId ?? 0) ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.sender_user_id === (userId ?? 0) ? "#2563eb" : "var(--surface, #f1f5f9)",
                      color: msg.sender_user_id === (userId ?? 0) ? "#fff" : "var(--text-default)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.created_at && (
                    <span style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ввод */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Написать сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim()}>
              Отправить
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 14 }}>
          Выбери комнату слева чтобы начать чат
        </div>
      )}
    </div>
  );
}
