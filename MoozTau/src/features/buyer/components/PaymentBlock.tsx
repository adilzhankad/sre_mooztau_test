import type { BuyerOrder } from "@/types";
import { money, shortDate } from "../lib/format";

interface Props {
  order: BuyerOrder;
}

export function PaymentBlock({ order }: Props) {
  const total = Number(order.final_amount || 0);
  const paid = Number(order.payment_received || 0);
  const remaining = Math.max(0, total - paid);
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const payments = order.payments || [];

  const barColor = pct === 100 ? "var(--buyer-success)" : "var(--buyer-info)";

  return (
    <section className="buyer-surface" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 className="buyer-text" style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
          Оплата
        </h2>
        <span className="buyer-muted" style={{ fontSize: 12, fontWeight: 900 }}>
          {pct}%
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          height: 10,
          borderRadius: 999,
          background: "var(--buyer-surface-muted)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 999,
            background: barColor,
            transition: "width 240ms ease",
          }}
        />
      </div>

      <dl style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Cell tone="neutral" label="Всего" value={money(total)} />
        <Cell tone="success" label="Оплачено" value={money(paid)} />
        <Cell tone="warning" label="Остаток" value={money(remaining)} />
      </dl>

      {payments.length > 0 && (
        <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
          {payments.map((p) => {
            const dot =
              p.verification_status === "confirmed"
                ? "var(--buyer-success)"
                : p.verification_status === "risk"
                  ? "var(--buyer-danger)"
                  : "var(--buyer-warning)";

            return (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderTop: "1px solid rgba(26, 34, 45, 0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flexShrink: 0 }} />
                  <span className="buyer-text" style={{ fontSize: 13, fontWeight: 900 }}>
                    {money(p.amount)}
                  </span>
                  <span className="buyer-muted" style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.payment_method}
                  </span>
                </div>
                <span className="buyer-muted" style={{ fontSize: 12, flexShrink: 0 }}>
                  {shortDate(p.payment_date)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Cell({
  tone,
  label,
  value,
}: {
  tone: "neutral" | "success" | "warning";
  label: string;
  value: string;
}) {
  const bg =
    tone === "success"
      ? "var(--buyer-success-soft)"
      : tone === "warning"
        ? "var(--buyer-warning-soft)"
        : "var(--buyer-surface-alt)";
  const fg =
    tone === "success"
      ? "var(--buyer-success)"
      : tone === "warning"
        ? "var(--buyer-warning)"
        : "var(--buyer-muted)";

  return (
    <div style={{ borderRadius: 20, padding: 12, background: bg, border: "1px solid rgba(26, 34, 45, 0.06)" }}>
      <dt style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.7, color: fg }}>
        {label}
      </dt>
      <dd className="buyer-text" style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 900 }}>
        {value}
      </dd>
    </div>
  );
}

