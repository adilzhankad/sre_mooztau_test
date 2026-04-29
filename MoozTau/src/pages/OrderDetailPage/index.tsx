import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  useAddPayment,
  useOrder,
  useOrderHistory,
  useUpdateOrderItem,
  useUpdateOrderStatus,
  useVerifyPayment,
} from "@/hooks/useOrders";
import { usePrices } from "@/hooks/useProducts";
import { useAuthStore } from "@/stores/auth-store";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { formatMoney } from "@/lib/order-helpers";
import { canAddPayment as canAddPaymentForRole } from "@/lib/permissions";
import type { OrderStatus, ReturnType, UserRole } from "@/types";

import { TRANSITIONS } from "./_constants";
import { OrderDetailSkeleton } from "./_components/OrderDetailSkeleton";
import { OrderHeader } from "./_components/OrderHeader";
import { OrderWorkflowCard } from "./_components/OrderWorkflowCard";
import { OrderAmountCard } from "./_components/OrderAmountCard";
import { OrderClientCard } from "./_components/OrderClientCard";
import { OrderContractCard } from "./_components/OrderContractCard";
import { OrderItemsCard } from "./_components/OrderItemsCard";
import { OrderPaymentsCard } from "./_components/OrderPaymentsCard";
import { OrderDeliveryCard } from "./_components/OrderDeliveryCard";
import { OrderHistoryCard } from "./_components/OrderHistoryCard";
import { OrderStatusActions } from "./_components/OrderStatusActions";
import { OrderMatchingActions } from "./_components/OrderMatchingActions";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const location = useLocation();
  const autoOpenVerify = !!(location.state as any)?.autoOpenVerify;

  const role = useAuthStore((s) => s.role);
  const upperRole = role?.toUpperCase() ?? "";
  const isFactory = upperRole === "FACTORY_ADMIN" || upperRole === "FACTORY_WORKER";
  const isDesktop = useIsDesktop();
  const px = `var(--page-x${isDesktop ? "" : "-mobile"})`;

  const { data: order, isLoading } = useOrder(orderId);
  const { data: history } = useOrderHistory(orderId);
  const { data: prices } = usePrices();
  const statusMutation = useUpdateOrderStatus(orderId);
  const paymentMutation = useAddPayment(orderId);
  const verifyPaymentMutation = useVerifyPayment(orderId);
  const itemMutation = useUpdateOrderItem(orderId);

  const [statusNote, setStatusNote] = useState("");
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState<ReturnType>("client");

  const priceMap = new Map<number, number>();
  prices?.forEach((p) => {
    if (p.recommended_price && !priceMap.has(p.product_id)) {
      priceMap.set(p.product_id, p.recommended_price);
    }
  });

  if (isLoading || !order) return <OrderDetailSkeleton />;
  const currentOrder = order;

  const rawAllowedTransitions: OrderStatus[] =
    (upperRole ? TRANSITIONS[upperRole]?.[currentOrder.status] : undefined) ?? [];

  // Matching mode hides the standard waiting_courier→in_transit and master cabinet
  // handles in_transit→completed, so skip those from the generic workflow card.
  const isMatchingOrder = currentOrder.delivery_mode === "matching";
  const allowedTransitions: OrderStatus[] = rawAllowedTransitions.filter((s) => {
    if (isMatchingOrder && upperRole === "LOGISTICS" && currentOrder.status === "waiting_courier" && s === "in_transit") return false;
    if (isMatchingOrder && upperRole === "LOGISTICS" && currentOrder.status === "in_transit" && s === "completed") return false;
    return true;
  });

  const primaryTransition =
    allowedTransitions.find((s) => !["rejected", "cancelled", "returned"].includes(s)) ?? null;
  const dangerTransitions = allowedTransitions.filter((s) => ["rejected", "cancelled", "returned"].includes(s));
  const secondaryTransitions = allowedTransitions.filter((s) => s !== primaryTransition && !dangerTransitions.includes(s));

  const isPrimaryBlocked = primaryTransition === "completed" && currentOrder.payment_remaining > 0;

  const canAddPayment =
    canAddPaymentForRole(upperRole as UserRole) &&
    !["rejected", "completed", "returned", "cancelled"].includes(currentOrder.status);

  const canEditPrice =
    !isFactory &&
    (upperRole === "SUPER_ADMIN" || upperRole === "DEALER_ADMIN" || upperRole === "DEALER_MANAGER");

  function handleStatusChange(newStatus: OrderStatus) {
    if (newStatus === "completed" && currentOrder.payment_remaining > 0) {
      alert(`Нельзя завершить заказ — остаток: ${formatMoney(currentOrder.payment_remaining)}`);
      return;
    }
    if (newStatus === "returned") {
      setIsReturnModalOpen(true);
      return;
    }
    statusMutation.mutate({ status: newStatus, note: statusNote || undefined });
    setStatusNote("");
  }

  return (
    <div id="toast-root" style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      <OrderHeader
        orderNumber={currentOrder.order_number}
        status={currentOrder.status}
        statusDisplay={currentOrder.status_display}
        progress={currentOrder.progress}
        salesChannel={currentOrder.sales_channel}
      />

      <div style={{ padding: `12px ${px}`, paddingBottom: 24 }}>
        <div
          style={{
            display: isDesktop ? "grid" : "block",
            gridTemplateColumns: isDesktop ? "minmax(0, 7fr) minmax(0, 3fr)" : undefined,
            gap: isDesktop ? 12 : 10,
            alignItems: "start",
          }}
        >
          <div className="stack" style={{ gap: 10 }}>
            <OrderClientCard order={currentOrder} />

            <OrderItemsCard
              items={currentOrder.items}
              canEditPrice={canEditPrice}
              priceMap={priceMap}
              onUpdatePrice={(itemId, price) => itemMutation.mutate({ itemId, patch: { price_per_unit: price } })}
            />

            <OrderDeliveryCard order={currentOrder} />

            <OrderContractCard
              order={currentOrder}
              orderId={orderId}
              clientPhone={currentOrder.client_phone}
              hasContract={currentOrder.has_contract}
              contractStatus={(currentOrder.contract_status ?? (currentOrder.has_contract ? "created" : "missing")) as
                | "missing" | "created" | "scanned" | "signed"}
              scannedAt={currentOrder.contract_scanned_at}
              signedAt={currentOrder.contract_signed_at}
              signedIp={currentOrder.contract_signed_ip}
              signedUserAgent={currentOrder.contract_signed_user_agent}
              autoOpenVerify={autoOpenVerify}
            />

            <OrderHistoryCard history={history ?? []} />
          </div>

          <div
            className="stack"
            style={{
              gap: 10,
              position: isDesktop ? "sticky" : undefined,
              top: isDesktop ? 12 : undefined,
              alignSelf: "start",
            }}
          >
            <OrderWorkflowCard
              currentStatus={currentOrder.status}
              currentStatusDisplay={currentOrder.status_display}
              progress={currentOrder.progress}
              primary={primaryTransition}
              secondary={secondaryTransitions}
              isPending={statusMutation.isPending}
              primaryDisabled={isPrimaryBlocked}
              primaryDisabledHint={isPrimaryBlocked ? `Payment remaining: ${formatMoney(currentOrder.payment_remaining)}` : undefined}
              onTransition={handleStatusChange}
            />

            <OrderMatchingActions order={currentOrder} />

            {!isFactory && (
              <OrderAmountCard
                totalAmount={currentOrder.total_amount}
                paymentRemaining={currentOrder.payment_remaining}
                payments={currentOrder.payments ?? []}
              />
            )}

            {!isFactory && (
              <OrderPaymentsCard
                payments={currentOrder.payments ?? []}
                totalAmount={currentOrder.total_amount}
                paymentReceived={currentOrder.payment_received}
                canAddPayment={canAddPayment}
                isAdding={paymentMutation.isPending}
                isVerifying={verifyPaymentMutation.isPending}
                onAddPayment={(amount, method, note, category) =>
                  paymentMutation.mutate({
                    amount,
                    payment_date: new Date().toISOString().split("T")[0],
                    payment_method: method,
                    note,
                    category,
                  })
                }
                onVerifyPayment={(paymentId, status) =>
                  verifyPaymentMutation.mutate({
                    paymentId,
                    payload: {
                      verification_status: status,
                      verification_comment:
                        status === "confirmed"
                          ? "Оплата подтверждена менеджером"
                          : "Менеджер пометил оплату как риск",
                    },
                  })
                }
              />
            )}

            <OrderStatusActions
              dangerTransitions={dangerTransitions}
              statusNote={statusNote}
              isPending={statusMutation.isPending}
              onNoteChange={setStatusNote}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {isReturnModalOpen && (
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
        >
          <div
            className="card"
            style={{
              width: "min(520px, 100%)",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              padding: 14,
            }}
          >
            <div className="row-between" style={{ marginBottom: 10 }}>
              <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
                Оформить возврат
              </p>
              <button
                className="btn btn-ghost btn-icon-sm"
                onClick={() => setIsReturnModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="stack" style={{ gap: 10 }}>
              <div>
                <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
                  Тип возврата *
                </p>
                <select
                  className="input"
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value as ReturnType)}
                >
                  <option value="client">Клиентский</option>
                  <option value="defect">Дефект</option>
                  <option value="delivery_issue">Проблема доставки</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-default" style={{ margin: "0 0 6px" }}>
                  Причина *
                </p>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Опишите причину возврата..."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsReturnModalOpen(false)}
                  disabled={statusMutation.isPending}
                >
                  Отмена
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!returnReason.trim()) {
                      alert("Укажите причину возврата");
                      return;
                    }
                    statusMutation.mutate({
                      status: "returned",
                      note: statusNote || undefined,
                      return_reason: returnReason.trim(),
                      return_type: returnType,
                    });
                    setStatusNote("");
                    setReturnReason("");
                    setReturnType("client");
                    setIsReturnModalOpen(false);
                  }}
                  disabled={statusMutation.isPending}
                >
                  Оформить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
