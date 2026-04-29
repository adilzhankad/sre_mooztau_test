import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth-store";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatDate, formatMoney } from "@/lib/order-helpers";
import { ORDER_STATUS_BADGE_SIMPLE, displayStatus } from "@/lib/status-config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Order } from "@/types";

type Tab = "active" | "available" | "completed";

const TAB_FILTER: Record<Tab, string> = {
  active: "master_selected,in_transit",
  available: "matching",
  completed: "completed",
};

export function MasterDeliveriesPage() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("active");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useOrders({
    status: TAB_FILTER[tab].split(",") as never,
    page_size: 50,
  });

  const orders = useMemo(() => data?.results ?? [], [data]);

  if (role !== "MASTER" && role !== "SUPER_ADMIN") {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>{t("servicePage.accessDenied.title")}</h2>
          <p className="text-sm text-secondary" style={{ margin: "10px 0 0" }}>
            {t("servicePage.accessDenied.description")}
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: t("masterCabinet.tabs.active") },
    { id: "available", label: t("masterCabinet.tabs.available") },
    { id: "completed", label: t("masterCabinet.tabs.completed") },
  ];

  return (
    <div style={{ padding: "16px var(--page-x-mobile)", paddingBottom: "calc(var(--safe-bottom, 0px) + 88px)", maxWidth: 920, margin: "0 auto" }}>
      <h1 className="page-title" style={{ marginBottom: 14 }}>
        {t("masterCabinet.title")}
      </h1>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            style={{
              background: tab === tabItem.id ? "var(--text-default)" : "var(--bg-surface)",
              color: tab === tabItem.id ? "var(--bg-surface)" : "var(--text-default)",
              border: tab === tabItem.id ? "none" : "1px solid var(--border)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 10px",
            borderRadius: 8,
            background: "var(--danger-light, #FEE2E2)",
            color: "var(--danger, #B91C1C)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="stack" style={{ gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: 200, height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 12 }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
            {t(`masterCabinet.empty.${tab}`)}
          </p>
        </div>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {orders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onOpenDetail={() => navigate(`/orders/${order.id}`)}
              onError={setError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryCard({
  order,
  onOpenDetail,
  onError,
}: {
  order: Order;
  onOpenDetail: () => void;
  onError: (msg: string | null) => void;
}) {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.userId);
  const statusMutation = useUpdateOrderStatus(order.id);
  const isOwnOrder = order.master_id === userId;
  const badge = ORDER_STATUS_BADGE_SIMPLE[order.status];

  function handleStatus(newStatus: "in_transit" | "completed") {
    onError(null);
    statusMutation
      .mutateAsync({ status: newStatus })
      .catch((e) => onError(getApiErrorMessage(e)));
  }

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 6 }}>
        <p className="text-sm font-bold text-default" style={{ margin: 0 }}>
          {order.order_number}
        </p>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 999,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {displayStatus(order.status, order.status_display)}
        </span>
      </div>

      {typeof order.progress === "number" && (
        <div style={{ marginBottom: 6 }}>
          <ProgressBar value={order.progress} status={order.status} height={4} />
        </div>
      )}

      <p className="text-xs text-secondary" style={{ margin: "0 0 4px" }}>
        <strong>{t("masterCabinet.clientLabel")}:</strong> {order.client_name} — {order.client_phone}
      </p>
      <p className="text-xs text-secondary" style={{ margin: "0 0 4px" }}>
        <strong>{t("masterCabinet.addressLabel")}:</strong> {order.client_region}, {order.delivery_address}
      </p>
      {order.deadline && (
        <p className="text-xs text-muted" style={{ margin: "0 0 4px" }}>
          {t("masterCabinet.deadlineLabel")}: {formatDate(order.deadline)}
        </p>
      )}
      {order.matching_started_at && order.status === "matching" && (
        <p className="text-xs text-muted" style={{ margin: "0 0 4px" }}>
          {t("masterCabinet.matchingStartedAt")}: {formatDate(order.matching_started_at)}
        </p>
      )}
      {order.payment_remaining > 0 && (
        <p className="text-xs" style={{ margin: "0 0 4px", color: "var(--danger)" }}>
          {t("ordersErrors.not_fully_paid")}: {formatMoney(order.payment_remaining)}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {isOwnOrder && order.status === "master_selected" && (
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => handleStatus("in_transit")}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending ? t("masterCabinet.accepting") : t("masterCabinet.accept")}
          </button>
        )}
        {isOwnOrder && order.status === "in_transit" && (
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => handleStatus("completed")}
            disabled={statusMutation.isPending || order.payment_remaining > 0}
            title={order.payment_remaining > 0 ? t("ordersErrors.not_fully_paid") : undefined}
          >
            {statusMutation.isPending ? t("masterCabinet.delivering") : t("masterCabinet.deliver")}
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={onOpenDetail}>
          {t("common.confirm")}
        </button>
      </div>
    </div>
  );
}
