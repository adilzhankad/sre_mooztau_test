import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFactoryOrder, useUpdateFactoryOrderStatus } from "@/hooks/useFactory";
import { ORDER_STATUS_LABELS, formatDate } from "@/lib/order-helpers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { OrderStatus, AnyOrderStatus } from "@/types";

const FACTORY_TRANSITIONS: Record<string, OrderStatus[]> = {
  in_progress: ["qc_review"],
  qc_passed: ["waiting_courier"],
  qc_rejected: ["in_progress"],
};

export function FactoryOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id ? Number(id) : null;
  const { data: order, isLoading } = useFactoryOrder(orderId);
  const updateStatus = useUpdateFactoryOrderStatus(orderId ?? 0);
  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <div
        className="center"
        style={{ minHeight: "100dvh", background: "var(--bg-base)" }}
      >
        <span className="text-sm text-secondary">Загрузка...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="center"
        style={{ minHeight: "100dvh", background: "var(--bg-base)" }}
      >
        <span className="text-sm" style={{ color: "var(--danger)" }}>
          Заказ не найден
        </span>
      </div>
    );
  }

  const handleStatusChange = async (status: OrderStatus) => {
    await updateStatus.mutateAsync({ status, note: note || undefined });
    setNote("");
  };

  const transitions = FACTORY_TRANSITIONS[order.status] ?? [];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="mobile-header">
        <button
          className="btn btn-ghost btn-icon-sm"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </button>
        <span className="page-title" style={{ flex: 1 }}>
          {order.order_number}
        </span>
        <StatusBadge status={order.status as AnyOrderStatus} />
      </div>

      {/* Content */}
      <div
        className="stack fade-up"
        style={{
          padding: "12px 16px",
          paddingBottom: transitions.length > 0 ? 100 : 24,
          gap: 10,
          flex: 1,
        }}
      >
        {/* Order info */}
        <div className="card">
          <p className="text-xs text-secondary" style={{ margin: 0 }}>
            Клиент
          </p>
          <p
            className="text-base font-semibold text-default"
            style={{ margin: "4px 0 0" }}
          >
            {order.client_name}
          </p>
          {order.client_region && (
            <p
              className="text-sm text-secondary"
              style={{ margin: "4px 0 0" }}
            >
              {order.client_region}
            </p>
          )}
          {order.deadline && (
            <div className="row gap-1" style={{ marginTop: 10 }}>
              <CalendarIcon />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--warning)" }}
              >
                Дедлайн: {formatDate(order.deadline)}
              </span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card">
          <div className="row gap-2" style={{ marginBottom: 14 }}>
            <h3
              className="card-title"
              style={{ margin: 0, flex: 1 }}
            >
              Позиции
            </h3>
            <span className="badge badge-neutral">{order.items.length}</span>
          </div>

          <div className="stack" style={{ gap: 8 }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                <div className="row-between">
                  <p
                    className="text-sm font-semibold text-default"
                    style={{ margin: 0 }}
                  >
                    {item.model}
                  </p>
                  <span className="text-sm text-secondary">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <p
                  className="text-xs text-secondary"
                  style={{ margin: "4px 0 0" }}
                >
                  {item.category}
                  {item.color && ` · ${item.color}`}
                  {item.length && ` · ${item.length}×${item.height}×${item.width}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {transitions.length === 0 && (
          <div className="card">
            <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
              Статус
            </p>
            <p className="text-sm text-secondary" style={{ margin: "6px 0 0" }}>
              Нет доступных действий для текущего статуса
            </p>
          </div>
        )}
      </div>

      {/* Sticky bottom action */}
      {transitions.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background: "var(--bg-surface)",
            padding: "12px 16px",
            paddingBottom: "calc(12px + var(--safe-bottom, 0px))",
            borderTop: "1px solid var(--border-light)",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <input
            className="input"
            placeholder="Примечание (необязательно)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div className="row gap-2">
            {transitions.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending}
                className="btn btn-primary btn-xl"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {updateStatus.isPending
                  ? "..."
                  : ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width={14}
      height={14}
      fill="none"
      viewBox="0 0 24 24"
      stroke="var(--warning)"
      strokeWidth={1.5}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
