import { formatMoney } from "@/lib/order-helpers";
import type { Order } from "@/types";

interface Props {
  order: Order;
  compact?: boolean;
}

export function PaymentInfo({ order, compact }: Props) {
  const total     = order.total_amount || 0;
  const paid      = order.payment_received || 0;
  const remaining = order.payment_remaining ?? (total - paid);
  const pct       = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;

  let label: string;
  let barColor: string;
  let textColor: string;

  if (pct >= 100) {
    label = "Оплачен";   barColor = "#22c55e"; textColor = "#16a34a";
  } else if (pct > 0) {
    label = `${pct}%`;   barColor = "#f59e0b"; textColor = "#d97706";
  } else {
    label = "Не оплачен"; barColor = "#e5e7eb"; textColor = "#9ca3af";
  }

  if (compact) {
    return (
      <div style={{ minWidth: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{label}</span>
          {pct < 100 && pct > 0 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              {formatMoney(paid)}/{formatMoney(total)}
            </span>
          )}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: barColor, transition: "width 0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minWidth: 100 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>{label}</span>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>
        {formatMoney(paid)} / {formatMoney(total)}
        {remaining > 0 && (
          <span style={{ color: "#ef4444", marginLeft: 4 }}>-{formatMoney(remaining)}</span>
        )}
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: barColor, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}
