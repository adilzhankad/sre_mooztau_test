import { useMemo } from "react";
import { formatMoney } from "@/lib/order-helpers";
import type { Payment } from "@/types";

interface Props {
  totalAmount: number;
  paymentRemaining: number;
  payments?: Payment[];
}

export function OrderAmountCard({ totalAmount, paymentRemaining, payments }: Props) {
  const paid = Math.max(totalAmount - paymentRemaining, 0);
  const pct = totalAmount > 0 ? (paid / totalAmount) * 100 : 0;
  const isPaid = paymentRemaining <= 0;

  const { confirmed, pending, risk } = useMemo(() => {
    const list = payments ?? [];
    const sum = (status: string) =>
      list
        .filter((p) => (p.verification_status ?? "confirmed") === status)
        .reduce((s, p) => s + (p.amount || 0), 0);
    return {
      confirmed: sum("confirmed"),
      pending: sum("review_required"),
      risk: sum("risk"),
    };
  }, [payments]);

  const needsVerification = pending + risk > 0;

  const barColor =
    pct < 30 ? "var(--danger)" : pct < 70 ? "var(--warning)" : "var(--success)";

  return (
    <div className="card">
      <p
        className="text-xs text-secondary font-medium"
        style={{ marginBottom: 4 }}
      >
        Сумма заказа
      </p>

      <p
        className="text-3xl font-extrabold tabnum tracking-tight"
        style={{ marginBottom: 10 }}
      >
        {formatMoney(totalAmount)}
      </p>

      <div className="progress-wrap" style={{ marginBottom: 10 }}>
        <div
          className="progress-bar"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: barColor,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: needsVerification ? 10 : 6,
        }}
      >
        <Stat
          label="Подтв."
          value={formatMoney(confirmed)}
          tone="success"
        />
        <Stat
          label="Ожидает"
          value={formatMoney(pending + risk)}
          tone={needsVerification ? "warning" : "neutral"}
        />
        <Stat
          label="Остаток"
          value={formatMoney(paymentRemaining)}
          tone={isPaid ? "success" : "danger"}
        />
      </div>

      {needsVerification && (
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "var(--warning-light)",
            color: "var(--warning-fg)",
            fontSize: 12,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          ⚠ Требуется проверка оплаты
        </div>
      )}

      <div className="row-between text-xs text-secondary" style={{ marginTop: 2 }}>
        <span>
          Оплачено: <strong className="text-default">{pct.toFixed(1)}%</strong>
        </span>
        <span className="tabnum">
          {formatMoney(paid)} / {formatMoney(totalAmount)}
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const color =
    tone === "success"
      ? "var(--success-fg)"
      : tone === "warning"
        ? "var(--warning-fg)"
        : tone === "danger"
          ? "var(--danger)"
          : "var(--text-default)";

  const borderColor =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "danger"
          ? "var(--danger)"
          : "var(--border-light)";

  return (
    <div
      style={{
        padding: "6px 8px",
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: "var(--bg-surface)",
        minWidth: 0,
      }}
    >
      <div
        className="text-xs text-muted"
        style={{ marginBottom: 2, whiteSpace: "nowrap" }}
      >
        {label}
      </div>
      <div
        className="tabnum"
        style={{
          fontSize: 12,
          fontWeight: 800,
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}
