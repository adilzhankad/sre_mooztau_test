import { useEffect, useState } from "react";
import { formatDate } from "@/lib/order-helpers";
import { getDeadlineState } from "@/lib/deadlines";
import { InfoRow } from "./InfoRow";
import type { Order } from "@/types";

export function OrderClientCard({ order }: { order: Order }) {
  const [deadlineState, setDeadlineState] = useState(() => getDeadlineState(order));

  useEffect(() => {
    if (!order.deadline) return;

    const update = () => setDeadlineState(getDeadlineState(order));
    update();

    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [order]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Клиент</span>
        {deadlineState && (
          <span className={`badge badge-${deadlineState.tone}`}>
            {deadlineState.label}
          </span>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
          {order.client_name}
        </p>
        {order.manager_name && (
          <p className="text-xs text-secondary" style={{ margin: "2px 0 0" }}>
            Менеджер: {order.manager_name}
          </p>
        )}
      </div>

      {order.deadline && deadlineState && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            borderLeft: `3px solid var(--${deadlineState.tone === "danger" ? "danger" : deadlineState.tone === "warning" ? "warning" : deadlineState.tone === "success" ? "success" : "text-muted"})`,
            marginBottom: 14,
          }}
        >
          <div className="row-between" style={{ marginBottom: 4 }}>
            <span className="text-xs text-secondary">Дедлайн</span>
            <span className="text-xs text-muted">{formatDate(order.deadline)}</span>
          </div>

          {deadlineState.kind === "active" ? (
            <p className="text-lg font-extrabold tabnum" style={{ margin: 0 }}>
              {deadlineState.countdown}
            </p>
          ) : (
            <>
              <p className="text-lg font-extrabold tabnum" style={{ margin: 0 }}>
                {deadlineState.durationLabel}
              </p>
              <p className="text-xs text-secondary" style={{ margin: "4px 0 0" }}>
                {deadlineState.timingLabel}
              </p>
            </>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <InfoRow label="Телефон" value={order.client_phone} />
        <InfoRow label="Регион" value={order.client_region} />
        {order.client_address && (
          <div style={{ gridColumn: "1 / -1" }}>
            <InfoRow label="Адрес" value={order.client_address} />
          </div>
        )}
      </div>

      {(order.organization_name || order.factory || order.manufacturer || order.sales_channel || order.contract_number) && (
        <>
          <p className="text-xs text-muted font-medium" style={{ marginBottom: 8 }}>Организация</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <InfoRow label="Компания" value={order.organization_name} />
            <InfoRow label="Фабрика" value={order.factory} />
            <InfoRow label="Производитель" value={order.manufacturer} />
            <InfoRow label="Канал продаж" value={order.sales_channel} />
            {order.contract_number && (
              <InfoRow label="Договор" value={order.contract_number} />
            )}
          </div>
        </>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <InfoRow label="Дата заказа" value={formatDate(order.order_date)} />
        {order.warranty_end_date && (
          <InfoRow label="Гарантия" value={formatDate(order.warranty_end_date)} />
        )}
      </div>
    </div>
  );
}
