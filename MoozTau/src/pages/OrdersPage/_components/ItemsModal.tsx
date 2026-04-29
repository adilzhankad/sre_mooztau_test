import { formatMoney } from "@/lib/order-helpers";
import type { Order } from "@/types";

interface Props {
  order: Order;
  onClose: () => void;
}

export function ItemsModal({ order, onClose }: Props) {
  const items = order.items ?? [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          width: "100%", maxWidth: 480, maxHeight: "80dvh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div className="text-sm font-bold text-default">{order.order_number}</div>
            <div className="text-xs text-muted">{items.length} позиций</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon-sm">
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div style={{ overflow: "auto", flex: 1, padding: "8px 0" }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{
                padding: "10px 16px",
                borderBottom: i < items.length - 1 ? "1px solid var(--border-light)" : undefined,
              }}
            >
              <div className="row-between" style={{ marginBottom: 3 }}>
                <span className="text-sm font-semibold text-default">{item.model}</span>
                <span className="text-sm font-bold tabnum" style={{ color: "var(--brand)" }}>
                  {formatMoney(item.total_price)}
                </span>
              </div>
              <div className="row-between">
                <span className="text-xs text-secondary">
                  {item.category}
                  {item.color && ` · ${item.color}`}
                  {item.length != null && ` · ${item.length}×${item.height}×${item.width}`}
                </span>
                <span className="text-xs text-muted tabnum">
                  {item.quantity} {item.unit} × {formatMoney(item.price_per_unit)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer total */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-light)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span className="text-sm font-semibold text-muted">Итого</span>
          <span className="text-base font-bold tabnum" style={{ color: "var(--brand)" }}>
            {formatMoney(order.total_amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
