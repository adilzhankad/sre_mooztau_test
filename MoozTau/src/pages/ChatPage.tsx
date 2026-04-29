import { useEffect, useRef, useState } from "react";
import { CHAT_API_URL } from "@/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

const WS_URL = CHAT_API_URL.replace(/^http/, "ws");

const ADMIN_ROLES = ["SUPER_ADMIN", "DEALER_ADMIN"];

interface Conversation {
  id: number;
  employee_id: number;
  employee_name: string;
  created_at: string;
  last_message_at: string;
}

interface DirectMessage {
  id?: number;
  type?: "message";
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at?: string;
}

export function ChatPage() {
  const userId = useAuthStore((s) => s.userId);
  const fullName = useAuthStore((s) => s.fullName ?? "Сотрудник");
  const role = useAuthStore((s) => s.role);
  const isAdmin = ADMIN_ROLES.includes(role ?? "");
  const isDark = useThemeStore((s) => s.mode) === "dark";

  const inBubbleBg = isDark ? "#334155" : "#f1f5f9";
  const inBubbleColor = isDark ? "#f1f5f9" : "#1e293b";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Сотрудник: при входе автоматически создаёт/открывает свой диалог
  useEffect(() => {
    if (isAdmin || !userId) return;

    fetch(`${CHAT_API_URL}/direct/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: userId, employee_name: fullName }),
    })
      .then((r) => r.json())
      .then((conv: Conversation) => {
        setConversations([conv]);
        setActiveConv(conv);
      })
      .catch(console.error);
  }, [isAdmin, userId, fullName]);

  // Админ: загружает список всех диалогов
  useEffect(() => {
    if (!isAdmin) return;

    fetch(`${CHAT_API_URL}/direct/conversations`)
      .then((r) => r.json())
      .then(setConversations)
      .catch(console.error);
  }, [isAdmin]);

  // Подключение к диалогу через WebSocket
  useEffect(() => {
    if (!activeConv || !userId) return;

    fetch(`${CHAT_API_URL}/direct/conversations/${activeConv.id}/messages?limit=100`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(console.error);

    const ws = new WebSocket(
      `${WS_URL}/ws/direct/${activeConv.id}?user_id=${userId}&user_name=${encodeURIComponent(fullName)}`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: DirectMessage = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data]);
        // Обновляем last_message_at в списке
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id ? { ...c, last_message_at: data.created_at ?? c.last_message_at } : c
          )
        );
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setMessages([]);
    };
  }, [activeConv, userId, fullName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: text }));
    setInput("");
  }

  // ── Сотрудник ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", background: "var(--bg)" }}>
        {/* Заголовок */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "var(--primary, #2563eb)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 15, flexShrink: 0,
          }}>
            А
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Администратор</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Поддержка</p>
          </div>
        </div>

        {/* Сообщения */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginTop: 40 }}>
              Напишите сообщение — администратор ответит вам здесь
            </p>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === (userId ?? 0);
            return (
              <div key={msg.id ?? i} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "70%", padding: "10px 14px",
                  borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMine ? "#2563eb" : inBubbleBg,
                  color: isMine ? "#fff" : inBubbleColor,
                  fontSize: 14, lineHeight: 1.5, wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
                {msg.created_at && (
                  <span style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 3 }}>
                    {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Ввод */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
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
    );
  }

  // ── Админ ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100vh - 56px)", background: "var(--bg)" }}>
      {/* Sidebar — список сотрудников */}
      <aside style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)" }}>
            Диалоги сотрудников
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 && (
            <p style={{ padding: "16px", margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Нет активных диалогов
            </p>
          )}
          {conversations.map((conv) => {
            const isActive = activeConv?.id === conv.id;
            const initials = conv.employee_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "12px 16px", border: "none",
                  background: isActive ? "var(--primary-soft, #eff6ff)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--primary, #2563eb)" : "3px solid transparent",
                  cursor: "pointer", display: "flex", gap: 10, alignItems: "center",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: isActive ? "#2563eb" : "var(--surface, #e2e8f0)",
                  color: isActive ? "#fff" : "var(--text-default)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13,
                }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: isActive ? 700 : 500, color: "var(--text-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {conv.employee_name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>
                    {new Date(conv.last_message_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Основная область */}
      {activeConv ? (
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Заголовок */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#2563eb", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {activeConv.employee_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{activeConv.employee_name}</p>
            </div>
          </div>

          {/* Сообщения */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginTop: 40 }}>
                Нет сообщений
              </p>
            )}
            {messages.map((msg, i) => {
              const isMine = msg.sender_id === (userId ?? 0);
              return (
                <div key={msg.id ?? i} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                  {!isMine && (
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
                      {msg.sender_name}
                    </span>
                  )}
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px",
                    borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMine ? "#2563eb" : "var(--surface, #f1f5f9)",
                    color: isMine ? "#fff" : "var(--text-default)",
                    fontSize: 14, lineHeight: 1.5, wordBreak: "break-word",
                  }}>
                    {msg.content}
                  </div>
                  {msg.created_at && (
                    <span style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 3 }}>
                      {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Ввод */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder={`Ответить ${activeConv.employee_name}...`}
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
          Выберите сотрудника слева чтобы начать диалог
        </div>
      )}
    </div>
  );
}
