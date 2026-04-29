import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDate, formatMoney } from "@/lib/order-helpers";
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  displayStatus,
} from "@/lib/status-config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { TRANSITIONS, NEXT_STATUS_LABELS } from "@/pages/OrderDetailPage/_constants";
import { DeadlineBadge } from "./DeadlineBadge";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

interface Props {
  orders: Order[];
  upperRole: string;
  onShowItems: (o: Order) => void;
}

const TERMINAL: OrderStatus[] = ["completed", "returned", "cancelled", "rejected"];

function isOverdue(order: Order, todayISO: string): boolean {
  if (!order.deadline) return false;
  if (TERMINAL.includes(order.status)) return false;
  return order.deadline < todayISO;
}

export function OrdersTable({ orders, upperRole, onShowItems }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 120 }}>{t("ordersPage.table.order")}</th>
            <th>{t("ordersPage.table.client")}</th>
            <th style={{ width: 150 }}>{t("ordersPage.table.amount")}</th>
            <th style={{ width: 160 }}>{t("ordersPage.table.status")}</th>
            <th style={{ width: 130 }}>{t("ordersPage.table.payment")}</th>
            <th style={{ width: 150 }}>{t("ordersPage.table.deadline")}</th>
            <th style={{ width: 180 }}>{t("ordersPage.table.action")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const overdue = isOverdue(o, todayISO);
            return (
              <tr
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                style={{
                  cursor: "pointer",
                  boxShadow: overdue ? "inset 3px 0 0 #EF4444" : undefined,
                }}
              >
                <td className="td-primary tabnum" style={{ fontWeight: 700 }}>
                  {o.order_number}
                </td>
                <td className="td-main" style={{ minWidth: 200 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o.client_name}
                    </span>
                    <button
                      className="text-xs"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: "var(--link-color)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowItems(o);
                      }}
                      title={t("ordersPage.table.items")}
                    >
                      {t("ordersPage.table.items")}
                    </button>
                  </div>
                  {o.sales_channel && (
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                      {o.sales_channel}
                    </div>
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <div
                    className="tabnum"
                    style={{ fontWeight: 800, color: "var(--text-default)" }}
                  >
                    {formatMoney(o.total_amount)}
                  </div>
                  {o.payment_remaining > 0 && (
                    <div
                      className="text-xs text-muted tabnum"
                      style={{ marginTop: 2 }}
                    >
                      {t("ordersPage.table.due")}: {formatMoney(o.payment_remaining)}
                    </div>
                  )}
                </td>
                <td>
                  <div className="stack" style={{ gap: 6 }}>
                    <OrderStatusBadge status={o.status} display={o.status_display} />
                    {typeof o.progress === "number" && (
                      <ProgressBar value={o.progress} status={o.status} height={4} />
                    )}
                  </div>
                </td>
                <td>
                  <PaymentBadge status={o.payment_status} />
                </td>
                <td>
                  {o.deadline ? (
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="text-sm text-default tabnum">
                        {formatDate(o.deadline)}
                      </div>
                      <DeadlineBadge order={o} compact />
                    </div>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <OrderQuickAction order={o} upperRole={upperRole} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderStatusBadge({ status, display }: { status: OrderStatus; display?: string }) {
  const badge = ORDER_STATUS_BADGE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 999,
        background: badge.bg,
        color: badge.color,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: badge.dot,
        }}
      />
      {displayStatus(status, display)}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus | null }) {
  const badge = status ? PAYMENT_STATUS_BADGE[status] : undefined;
  if (!status || !badge) return <span className="text-sm text-muted">—</span>;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 999,
        background: badge.bg,
        color: badge.color,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: badge.dot,
        }}
      />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function OrderQuickAction({ order, upperRole }: { order: Order; upperRole: string }) {
  const mutation = useUpdateOrderStatus(order.id);

  const next = useMemo(() => {
    const allowed: OrderStatus[] =
      (upperRole ? TRANSITIONS[upperRole]?.[order.status] : undefined) ?? [];
    return allowed.find((s) => !["rejected", "cancelled", "returned"].includes(s));
  }, [order.status, upperRole]);

  if (!next) return <span className="text-sm text-muted">—</span>;

  const isBlocked = next === "completed" && order.payment_remaining > 0;
  const label = NEXT_STATUS_LABELS[next] ?? ORDER_STATUS_LABELS[next];

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      disabled={mutation.isPending || isBlocked}
      onClick={() => mutation.mutate({ status: next })}
      title={
        isBlocked
          ? `Payment remaining: ${formatMoney(order.payment_remaining)}`
          : label
      }
      style={{ width: "100%", justifyContent: "center" }}
    >
      {mutation.isPending ? "…" : label}
    </button>
  );
}
