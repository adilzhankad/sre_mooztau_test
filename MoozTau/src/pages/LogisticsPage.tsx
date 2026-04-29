import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLogisticsOrders,
  useLogisticsDashboard,
  useAssignCourier,
  useDispatchOrder,
  useDeliverOrder,
} from "@/hooks/useLogistics";
import { formatDate } from "@/lib/order-helpers";
import { STATUS_COLORS, displayStatus } from "@/lib/status-config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LogisticsOrder, OrderStatus } from "@/types";

const TABS = [
  { filter: "waiting_courier", label: "Ожидают курьера" },
  { filter: "matching", label: "Подбор мастера" },
  { filter: "master_selected", label: "Мастер назначен" },
  { filter: "in_transit", label: "В пути" },
  { filter: "completed", label: "Доставлены" },
] as const;

const DASHBOARD_CARDS = [
  { key: "waiting_courier", label: "Ожидают курьера", color: "#8B5CF6" },
  { key: "matching", label: "Подбор мастера", color: "#A855F7" },
  { key: "master_selected", label: "Мастер назначен", color: "#0EA5E9" },
  { key: "in_transit", label: "В пути", color: "#06B6D4" },
  { key: "delivered_today", label: "Доставлено сегодня", color: "#14B8A6" },
  { key: "delivered_total", label: "Всего доставлено", color: "#22C55E" },
] as const;

export function LogisticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("waiting_courier");
  const { data: dashboard } = useLogisticsDashboard();
  const { data: orders, isLoading } = useLogisticsOrders(activeTab);

  const [modalOrder, setModalOrder] = useState<LogisticsOrder | null>(null);
  const [modalType, setModalType] = useState<"courier" | "dispatch" | "deliver" | null>(null);
  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");

  function openModal(order: LogisticsOrder, type: "courier" | "dispatch" | "deliver") {
    setModalOrder(order);
    setModalType(type);
    setCourierName(order.courier_name ?? "");
    setCourierPhone(order.courier_phone ?? "");
    setPhotoUrl("");
    setNote("");
  }

  function closeModal() {
    setModalOrder(null);
    setModalType(null);
  }

  return (
    <div>
      {/* Dashboard */}
      {dashboard && (
        <div
          className="stagger"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16 }}
        >
          {DASHBOARD_CARDS.map((c) => (
            <div key={c.key} className="card">
              <p className="stat-value" style={{ marginBottom: 4 }}>
                {dashboard[c.key as keyof typeof dashboard] ?? 0}
              </p>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: c.color + "18",
                  color: c.color,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.filter}
            className={`btn btn-sm ${activeTab === tab.filter ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab(tab.filter)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="stack" style={{ padding: "0 16px 16px", gap: 10 }}>
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: 140, height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 200, height: 11, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 120, height: 11 }} />
            </div>
          ))
        ) : orders && orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={(type) => openModal(order, type)}
              onOpenDetail={() => navigate(`/orders/${order.id}`)}
            />
          ))
        ) : (
          <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
            <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
              Нет заказов
            </p>
            <p className="text-xs text-secondary">В этой категории пусто</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOrder && modalType && (
        <ActionModal
          order={modalOrder}
          type={modalType}
          courierName={courierName}
          courierPhone={courierPhone}
          photoUrl={photoUrl}
          note={note}
          onCourierNameChange={setCourierName}
          onCourierPhoneChange={setCourierPhone}
          onPhotoUrlChange={setPhotoUrl}
          onNoteChange={setNote}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onAction,
  onOpenDetail,
}: {
  order: LogisticsOrder;
  onAction: (type: "courier" | "dispatch" | "deliver") => void;
  onOpenDetail: () => void;
}) {
  const statusColor = STATUS_COLORS[order.status as OrderStatus] ?? "#6B7280";
  const statusLabel = displayStatus(order.status as OrderStatus, order.status_display);
  const isMatching = order.delivery_mode === "matching";
  const masterReady = isMatching && order.status === "master_selected";

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 6 }}>
        <p className="text-sm font-bold text-default" style={{ margin: 0 }}>
          {order.order_number}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 6,
            background: statusColor + "18",
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {isMatching && (
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: 4,
            background: "#F3E8FF",
            color: "#7E22CE",
            marginBottom: 4,
          }}
        >
          inDriver-style
        </span>
      )}

      {typeof order.progress === "number" && (
        <div style={{ marginBottom: 6 }}>
          <ProgressBar value={order.progress} status={order.status as OrderStatus} height={4} />
        </div>
      )}

      <p className="text-xs text-secondary" style={{ margin: "0 0 2px" }}>
        {order.client_name} — {order.client_phone}
      </p>
      <p className="text-xs text-secondary" style={{ margin: "0 0 2px" }}>
        {order.client_region}, {order.delivery_address}
      </p>

      {!isMatching && order.courier_name && (
        <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
          Курьер: {order.courier_name} ({order.courier_phone})
        </p>
      )}

      {isMatching && order.master_name && (
        <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
          Мастер: {order.master_name}{order.master_phone ? ` (${order.master_phone})` : ""}
        </p>
      )}

      {order.deadline && (
        <p className="text-xs text-muted" style={{ margin: "2px 0 0" }}>
          Дедлайн: {formatDate(order.deadline)}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {/* Standard delivery actions */}
        {!isMatching && order.status === "waiting_courier" && !order.courier_name && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onAction("courier")}>
            Назначить курьера
          </button>
        )}
        {!isMatching && order.status === "waiting_courier" && order.courier_name && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onAction("dispatch")}>
            Отгрузить
          </button>
        )}

        {/* Matching: actions live in detail page */}
        {isMatching && (order.status === "waiting_courier" || order.status === "matching") && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onOpenDetail}>
            {order.status === "waiting_courier" ? "Запустить подбор" : "Выбрать мастера"}
          </button>
        )}
        {masterReady && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onAction("dispatch")}>
            Отгрузить
          </button>
        )}

        {order.status === "in_transit" && (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onAction("deliver")}>
            Доставлен
          </button>
        )}

        <button className="btn btn-secondary btn-sm" onClick={onOpenDetail}>
          Подробнее
        </button>
      </div>
    </div>
  );
}

function ActionModal({
  order,
  type,
  courierName,
  courierPhone,
  photoUrl,
  note,
  onCourierNameChange,
  onCourierPhoneChange,
  onPhotoUrlChange,
  onNoteChange,
  onClose,
}: {
  order: LogisticsOrder;
  type: "courier" | "dispatch" | "deliver";
  courierName: string;
  courierPhone: string;
  photoUrl: string;
  note: string;
  onCourierNameChange: (v: string) => void;
  onCourierPhoneChange: (v: string) => void;
  onPhotoUrlChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onClose: () => void;
}) {
  const assignMutation = useAssignCourier(order.id);
  const dispatchMutation = useDispatchOrder(order.id);
  const deliverMutation = useDeliverOrder(order.id);

  const isPending = assignMutation.isPending || dispatchMutation.isPending || deliverMutation.isPending;

  async function handleSubmit() {
    if (type === "courier") {
      if (!courierName.trim() || !courierPhone.trim()) {
        alert("Заполните имя и телефон курьера");
        return;
      }
      await assignMutation.mutateAsync({ courier_name: courierName, courier_phone: courierPhone });
    } else if (type === "dispatch") {
      await dispatchMutation.mutateAsync({ dispatch_photo_url: photoUrl, note });
    } else {
      await deliverMutation.mutateAsync({ delivery_photo_url: photoUrl, note });
    }
    onClose();
  }

  const title = type === "courier"
    ? "Назначить курьера"
    : type === "dispatch"
      ? "Отгрузить заказ"
      : "Подтвердить доставку";

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 999, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card stack"
        style={{ maxWidth: 420, width: "100%", gap: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-default" style={{ margin: 0 }}>
          {title} — {order.order_number}
        </h3>

        {type === "courier" ? (
          <>
            <input
              className="input"
              placeholder="Имя курьера"
              value={courierName}
              onChange={(e) => onCourierNameChange(e.target.value)}
            />
            <input
              className="input"
              placeholder="Телефон курьера"
              value={courierPhone}
              onChange={(e) => onCourierPhoneChange(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              className="input"
              placeholder="URL фото"
              value={photoUrl}
              onChange={(e) => onPhotoUrlChange(e.target.value)}
            />
            <input
              className="input"
              placeholder="Комментарий"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "..." : type === "courier" ? "Назначить" : type === "dispatch" ? "Отгрузить" : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
}
