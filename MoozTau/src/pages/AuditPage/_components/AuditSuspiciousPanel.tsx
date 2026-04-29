import type { SuspiciousPatterns } from "@/types";
import { formatAuditDate } from "../utils";

export function AuditSuspiciousPanel({ data }: { data?: SuspiciousPatterns }) {
  if (!data) {
    return (
      <div className="card" style={{ padding: 16 }}>
        <div className="skeleton" style={{ width: "100%", height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "70%", height: 10 }} />
      </div>
    );
  }

  if (data.mass_deletions.length === 0 && data.night_logins.length === 0) {
    return (
      <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
        <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
          Подозрительных событий не найдено
        </p>
        <p className="text-xs text-secondary">За последние дни система выглядит спокойно.</p>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      {data.mass_deletions.length > 0 ? (
        <section className="card" style={{ padding: 16, borderLeft: "4px solid #ef4444" }}>
          <h3 style={{ margin: 0, color: "#ef4444" }}>Массовые удаления</h3>
          <div className="stack" style={{ gap: 8, marginTop: 12 }}>
            {data.mass_deletions.map((item) => (
              <div key={`${item.user_id}-${item.first_event}`} style={{ paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
                <div className="text-sm text-default">
                  {item.user_role || "Неизвестная роль"} • ID {item.user_id} • {item.delete_count} удалений
                </div>
                <div className="text-xs text-secondary">
                  {formatAuditDate(item.first_event)} - {formatAuditDate(item.last_event)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.night_logins.length > 0 ? (
        <section className="card" style={{ padding: 16, borderLeft: "4px solid #f59e0b" }}>
          <h3 style={{ margin: 0, color: "#f59e0b" }}>Ночные входы</h3>
          <div className="stack" style={{ gap: 8, marginTop: 12 }}>
            {data.night_logins.map((item) => (
              <div key={`${item.user_id}-${item.event_time}`} style={{ paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
                <div className="text-sm text-default">
                  {item.user_role || "Неизвестная роль"} • ID {item.user_id}
                </div>
                <div className="text-xs text-secondary">
                  {formatAuditDate(item.event_time)}
                  {item.ip_address ? ` • IP ${item.ip_address}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
