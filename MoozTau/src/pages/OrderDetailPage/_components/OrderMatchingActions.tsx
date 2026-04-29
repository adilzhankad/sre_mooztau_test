import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useStartMatching,
  useSelectMaster,
  useDispatchOrder,
  useDeliverOrder,
} from "@/hooks/useLogistics";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { useServiceMasters } from "@/hooks/useService";
import { useAuthStore } from "@/stores/auth-store";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatMoney } from "@/lib/order-helpers";
import type { Order } from "@/types";

interface Props {
  order: Order;
}

export function OrderMatchingActions({ order }: Props) {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const upperRole = role?.toUpperCase() ?? "";

  const isLogistics = upperRole === "LOGISTICS" || upperRole === "SUPER_ADMIN";
  const isMaster = upperRole === "MASTER";
  const isMatchingOrder = order.delivery_mode === "matching";

  const startMatching = useStartMatching(order.id);
  const selectMaster = useSelectMaster(order.id);
  const dispatchOrder = useDispatchOrder(order.id);
  const deliverOrder = useDeliverOrder(order.id);
  const statusMutation = useUpdateOrderStatus(order.id);

  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: masters } = useServiceMasters();
  const availableMasters = useMemo(
    () => (masters ?? []).filter((m) => m.id !== userId),
    [masters, userId],
  );

  function handleAsync(promise: Promise<unknown>, after?: () => void) {
    setError(null);
    promise
      .then(() => {
        after?.();
      })
      .catch((e) => setError(getApiErrorMessage(e)));
  }

  // Render only when something to show
  const showBlock =
    (isLogistics && isMatchingOrder &&
      ["waiting_courier", "matching", "master_selected"].includes(order.status)) ||
    (isMaster && order.master_id === userId &&
      (order.status === "master_selected" || order.status === "in_transit")) ||
    (isLogistics && isMatchingOrder && order.status === "in_transit");

  if (!showBlock) return null;

  const isPending =
    startMatching.isPending ||
    selectMaster.isPending ||
    dispatchOrder.isPending ||
    deliverOrder.isPending ||
    statusMutation.isPending;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{t("matching.blockTitle")}</span>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {/* LOGISTICS — start matching */}
        {isLogistics && isMatchingOrder && order.status === "waiting_courier" && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isPending}
            onClick={() => handleAsync(startMatching.mutateAsync({ note: note || undefined }))}
          >
            {startMatching.isPending ? t("matching.starting") : t("matching.startMatching")}
          </button>
        )}

        {/* LOGISTICS — select master */}
        {isLogistics && isMatchingOrder && order.status === "matching" && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isPending}
            onClick={() => setShowSelectModal(true)}
          >
            {t("matching.selectMaster")}
          </button>
        )}

        {/* LOGISTICS — dispatch */}
        {isLogistics && isMatchingOrder && order.status === "master_selected" && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isPending}
              onClick={() =>
                handleAsync(dispatchOrder.mutateAsync({ note: note || undefined }))
              }
            >
              {t("orderStatus.in_transit")}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={isPending}
              onClick={() => setShowSelectModal(true)}
            >
              {t("matching.changeMaster")}
            </button>
          </>
        )}

        {/* LOGISTICS — deliver in matching mode */}
        {isLogistics && isMatchingOrder && order.status === "in_transit" && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isPending || order.payment_remaining > 0}
            title={order.payment_remaining > 0 ? formatMoney(order.payment_remaining) : undefined}
            onClick={() =>
              handleAsync(deliverOrder.mutateAsync({ note: note || undefined }))
            }
          >
            {t("masterCabinet.deliver")}
          </button>
        )}

        {/* MASTER — accept own order */}
        {isMaster && order.master_id === userId && order.status === "master_selected" && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isPending}
            onClick={() =>
              handleAsync(statusMutation.mutateAsync({ status: "in_transit" }))
            }
          >
            {statusMutation.isPending ? t("masterCabinet.accepting") : t("masterCabinet.accept")}
          </button>
        )}

        {/* MASTER — deliver own order */}
        {isMaster && order.master_id === userId && order.status === "in_transit" && (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={isPending || order.payment_remaining > 0}
            title={
              order.payment_remaining > 0
                ? `${t("ordersErrors.not_fully_paid")}: ${formatMoney(order.payment_remaining)}`
                : undefined
            }
            onClick={() =>
              handleAsync(statusMutation.mutateAsync({ status: "completed" }))
            }
          >
            {statusMutation.isPending ? t("masterCabinet.delivering") : t("masterCabinet.deliver")}
          </button>
        )}

        {isLogistics && (
          <input
            className="input"
            placeholder={t("matching.noteOptional")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}

        {error && (
          <div
            style={{
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
      </div>

      {/* Select-master modal */}
      {showSelectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
          onClick={() => setShowSelectModal(false)}
        >
          <div
            className="card stack"
            style={{ maxWidth: 480, width: "100%", gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-default" style={{ margin: 0 }}>
              {t("matching.selectMasterTitle")}
            </h3>

            {availableMasters.length === 0 ? (
              <p className="text-sm text-secondary" style={{ margin: 0 }}>
                {t("matching.noActiveMasters")}
              </p>
            ) : (
              <select
                className="input"
                value={selectedMasterId}
                onChange={(e) => setSelectedMasterId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">{t("matching.selectMasterPlaceholder")}</option>
                {availableMasters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            )}

            <input
              className="input"
              placeholder={t("matching.noteOptional")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSelectModal(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!selectedMasterId || selectMaster.isPending}
                onClick={() =>
                  handleAsync(
                    selectMaster.mutateAsync({
                      master_id: Number(selectedMasterId),
                      note: note || undefined,
                    }),
                    () => {
                      setShowSelectModal(false);
                      setSelectedMasterId("");
                      setNote("");
                    },
                  )
                }
              >
                {selectMaster.isPending ? t("matching.selecting") : t("matching.confirmSelect")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
