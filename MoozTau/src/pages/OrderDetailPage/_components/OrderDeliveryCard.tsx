import { useTranslation } from "react-i18next";
import { formatDate, formatDateTime } from "@/lib/order-helpers";
import { displayStatus } from "@/lib/status-config";
import { InfoRow } from "./InfoRow";
import type { Order } from "@/types";

export function OrderDeliveryCard({ order }: { order: Order }) {
  const { t } = useTranslation();
  const isMatching = order.delivery_mode === "matching";

  const hasAny =
    !!order.delivery_address ||
    !!order.courier_name ||
    !!order.courier_phone ||
    !!order.dispatch_date ||
    !!order.dispatch_photo_url ||
    !!order.delivery_photo_url ||
    isMatching;

  if (!hasAny) return null;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Delivery</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 999,
            background: isMatching ? "#F3E8FF" : "#E2E8F0",
            color: isMatching ? "#7E22CE" : "#475569",
          }}
        >
          {isMatching ? t("matching.modeMatching") : t("matching.modeStandard")}
        </span>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {order.delivery_address && (
          <InfoRow label="Address" value={order.delivery_address} />
        )}

        {!isMatching && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoRow label="Courier" value={order.courier_name} />
            <InfoRow label="Phone" value={order.courier_phone} />
          </div>
        )}

        {isMatching && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: order.master_id ? "#E0F2FE" : "#F3E8FF",
              border: `1px solid ${order.master_id ? "#BAE6FD" : "#E9D5FF"}`,
            }}
          >
            <p
              className="text-xs"
              style={{
                margin: 0,
                marginBottom: 4,
                fontWeight: 700,
                color: order.master_id ? "#0369A1" : "#7E22CE",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              {t("matching.blockTitle")}
            </p>

            {order.master_id ? (
              <>
                <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                  {order.master_name ?? "—"}
                </p>
                {order.master_phone && (
                  <a
                    href={`tel:${order.master_phone}`}
                    className="text-xs"
                    style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
                  >
                    {order.master_phone}
                  </a>
                )}
                {order.master_selected_at && (
                  <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
                    {t("matching.masterSelectedAt")}: {formatDateTime(order.master_selected_at)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                  {order.status === "matching"
                    ? t("matching.matchingInProgress")
                    : t("matching.noMaster")}
                </p>
                {order.matching_started_at && (
                  <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
                    {t("matching.matchingStartedAt")}: {formatDateTime(order.matching_started_at)}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <InfoRow label="Dispatch date" value={order.dispatch_date ? formatDate(order.dispatch_date) : "—"} />
          <InfoRow label="Status" value={displayStatus(order.status, order.status_display)} />
        </div>

        {(order.dispatch_photo_url || order.delivery_photo_url) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoRow label="Dispatch photo" value={order.dispatch_photo_url ? "Available" : "—"} />
            <InfoRow label="Delivery photo" value={order.delivery_photo_url ? "Available" : "—"} />
          </div>
        )}
      </div>
    </div>
  );
}
