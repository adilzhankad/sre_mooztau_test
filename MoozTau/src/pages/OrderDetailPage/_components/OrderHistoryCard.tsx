import { formatDate, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/order-helpers";
import type { OrderHistory } from "@/types";

const ACTION_DOT: Record<string, string> = {
  created: "var(--text-muted)",
  status_changed: "var(--brand)",
  item_updated: "var(--warning)",
  payment_added: "var(--success)",
};

function getMessage(h: OrderHistory): string {
  switch (h.action) {
    case "status_changed":
      return h.new_value
        ? `Статус → ${(ORDER_STATUS_LABELS as Record<string, string>)[h.new_value] ?? (PAYMENT_STATUS_LABELS as Record<string, string>)[h.new_value] ?? h.new_value}`
        : "Статус изменён";
    case "payment_added": return h.note ?? "Оплата добавлена";
    case "item_updated": return h.note ?? "Позиция обновлена";
    case "created": return "Заказ создан";
    default: return h.action;
  }
}

export function OrderHistoryCard({ history }: { history: OrderHistory[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">История</span>
        {history.length > 0 && (
          <span className="badge badge-neutral">{history.length}</span>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted" style={{ textAlign: "center", padding: "12px 0" }}>История пуста</p>
      ) : (
        <div style={{ position: "relative", paddingLeft: 20 }}>
          {/* timeline line */}
          <div style={{
            position: "absolute", left: 4, top: 5, bottom: 5,
            width: 2, background: "var(--border-light)", borderRadius: 2,
          }} />

          <div className="stack gap-4">
            {history.map((h, i) => (
              <div key={h.id} style={{ position: "relative" }}>
                {/* dot */}
                <div style={{
                  position: "absolute", left: -20, top: 4,
                  width: 10, height: 10, borderRadius: "50%",
                  background: i === 0 ? "var(--brand)" : (ACTION_DOT[h.action] ?? "var(--border)"),
                  border: "2px solid var(--bg-surface)",
                  boxShadow: "0 0 0 2px var(--border-light)",
                }} />

                <div className="row-between" style={{ marginBottom: 3 }}>
                  <span className="text-xs text-muted">
                    {formatDate(h.created_at)}{h.user_name && ` · ${h.user_name}`}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: 10, padding: "1px 6px" }}>
                    {h.action}
                  </span>
                </div>

                <p className="text-sm font-medium text-default" style={{ margin: 0 }}>{getMessage(h)}</p>

                {h.note && h.action !== "payment_added" && (
                  <p className="text-xs text-secondary" style={{ marginTop: 2, fontStyle: "italic" }}>{h.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
