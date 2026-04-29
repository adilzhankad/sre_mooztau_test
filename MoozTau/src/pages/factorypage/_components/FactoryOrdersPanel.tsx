import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/order-helpers";
import type { AnyOrderStatus, FactoryOrder } from "@/types";

export function FactoryOrdersPanel({
  orders,
  isLoading,
}: {
  orders: FactoryOrder[];
  isLoading: boolean;
}) {
  const navigate = useNavigate();

  return (
    <section className="factory-section">
      <div className="factory-section__head">
        <div>
          <p className="factory-section__eyebrow">Производство</p>
          <h2 className="factory-section__title">Активные заказы в работе</h2>
        </div>
        <div className="factory-section__meta">{orders.length} заказов</div>
      </div>

      <div className="factory-orders-grid">
        {isLoading
          ? [1, 2, 3].map((item) => (
              <div key={item} className="order-card" style={{ pointerEvents: "none" }}>
                <div className="skeleton" style={{ width: 110, height: 16, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: 140, height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 90, height: 12 }} />
              </div>
            ))
          : orders.map((order) => (
              <button
                key={order.id}
                className="order-card factory-orders-grid__card"
                onClick={() => navigate(`/factory/orders/${order.id}`)}
              >
                <div className="row-between" style={{ gap: 12, marginBottom: 10 }}>
                  <div>
                    <p className="text-sm font-bold text-default" style={{ marginBottom: 2 }}>
                      {order.order_number}
                    </p>
                    <p className="text-xs text-secondary">{order.factory}</p>
                  </div>
                  <StatusBadge status={order.status as AnyOrderStatus} size="sm" />
                </div>

                <div className="factory-order-meta">
                  <span>{order.client_name}</span>
                  <span>{order.client_region || "Регион не указан"}</span>
                  <span>{order.items.length} позиций</span>
                  <span>Дедлайн: {order.deadline ? formatDate(order.deadline) : "нет"}</span>
                </div>

                <div className="factory-order-items">
                  {order.items.slice(0, 3).map((item) => (
                    <span key={item.id} className="factory-chip">
                      {item.model}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="factory-chip factory-chip--muted">+{order.items.length - 3}</span>
                  )}
                </div>
              </button>
            ))}
      </div>

      {!isLoading && orders.length === 0 && (
        <div className="empty-state fade-up" style={{ padding: "52px 16px" }}>
          <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
            Активные заказы не найдены
          </p>
          <p className="text-xs text-secondary">
            Измени фильтры или проверь следующий этап в очереди QC.
          </p>
        </div>
      )}
    </section>
  );
}
