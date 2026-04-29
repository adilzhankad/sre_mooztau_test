import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/order-helpers";
import { ORDER_STATUS_BAR, displayStatus } from "@/lib/status-config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PaymentInfo } from "./PaymentInfo";
import { DeadlineBadge } from "./DeadlineBadge";
import { itemsSummary } from "../_utils/helpers";
import type { Order } from "@/types";

interface Props {
  order: Order;
  onShowItems: () => void;
}

export function OrderCard({ order, onShowItems }: Props) {
  const navigate = useNavigate();
  const bar = (ORDER_STATUS_BAR as Record<string, string>)[order.status] ?? "var(--brand)";

  return (
    <button className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
      <div style={{ width: 3, flexShrink: 0, background: bar }} />
      <div style={{ flex: 1, padding: "12px 13px" }}>

        {/* Row 1: номер + дата */}
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="text-sm font-bold tabnum" style={{ color: "var(--brand)" }}>
            {order.order_number}
          </span>
          <span className="text-xs text-muted">{formatDate(order.order_date)}</span>
        </div>

        {/* Row 2: клиент */}
        <div className="row gap-2" style={{ marginBottom: 5 }}>
          <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-sm font-medium text-default truncate">{order.client_name}</span>
        </div>

        {/* Row 3: товары (кликабельная) */}
        <div
          className="text-xs truncate"
          style={{ marginBottom: 6, color: "var(--brand)", cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onShowItems(); }}
        >
          {itemsSummary(order.items)}
        </div>

        {/* Row 4: статус + прогресс */}
        {(order.status_display || typeof order.progress === "number") && (
          <div className="row gap-2" style={{ marginBottom: 8, alignItems: "center" }}>
            <span
              className="text-xs"
              style={{ color: bar, fontWeight: 700, whiteSpace: "nowrap" }}
            >
              {displayStatus(order.status, order.status_display)}
            </span>
            {typeof order.progress === "number" && (
              <ProgressBar value={order.progress} status={order.status} height={4} />
            )}
          </div>
        )}

        {/* Row 5: оплата + дедлайн */}
        <div className="row-between" style={{ alignItems: "flex-end" }}>
          <PaymentInfo order={order} />
          <DeadlineBadge order={order} />
        </div>
      </div>
    </button>
  );
}
