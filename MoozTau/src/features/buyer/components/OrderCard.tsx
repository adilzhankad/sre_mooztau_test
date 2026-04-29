import type { BuyerOrder } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { deriveStage, needsBuyerAction } from "../lib/stage";
import { money, shortDate, orderTitle } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

interface Props {
  order: BuyerOrder;
  onOpen: (id: number) => void;
}

export function OrderCard({ order, onOpen }: Props) {
  const stage = deriveStage(order);
  const needsAction = needsBuyerAction(stage);

  return (
    <button
      type="button"
      onClick={() => onOpen(order.id)}
      className="buyer-surface"
      style={{
        width: "100%",
        textAlign: "left",
        padding: 16,
        display: "grid",
        gap: 12,
        cursor: "pointer",
        border: needsAction ? "1px solid rgba(161, 92, 7, 0.28)" : "var(--buyer-border)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div
            className="buyer-muted"
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            № {order.order_number}
          </div>
          <h3
            className="buyer-text"
            style={{
              margin: "4px 0 0",
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: -0.3,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {orderTitle(order.items)}
          </h3>
        </div>
        <StatusBadge stage={stage} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span className="buyer-text" style={{ fontSize: 18, fontWeight: 900 }}>
          {money(order.final_amount)}
        </span>
        <span className="buyer-muted" style={{ fontSize: 12 }}>
          {shortDate(order.order_date)}
        </span>
      </div>

      {typeof order.progress === "number" && (
        <ProgressBar value={order.progress} status={order.status} height={4} />
      )}

      {needsAction && (
        <div
          style={{
            borderRadius: 18,
            padding: "10px 12px",
            background: "var(--buyer-warning-soft)",
            color: "var(--buyer-warning)",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Ожидает вашего подтверждения
        </div>
      )}

      {order.payment_remaining > 0 && !needsAction && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span className="buyer-muted" style={{ fontSize: 12, fontWeight: 700 }}>
            К оплате
          </span>
          <span className="buyer-text" style={{ fontSize: 13, fontWeight: 900 }}>
            {money(order.payment_remaining)}
          </span>
        </div>
      )}
    </button>
  );
}

