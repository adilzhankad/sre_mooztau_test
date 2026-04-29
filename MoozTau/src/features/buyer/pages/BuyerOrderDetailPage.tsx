import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBuyerOrder } from "@/hooks/useBuyer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { deriveStage } from "../lib/stage";
import { money, fullDate } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { MasterBlock } from "../components/MasterBlock";
import { DeliveryBlock } from "../components/DeliveryBlock";
import { PaymentBlock } from "../components/PaymentBlock";
import { ActionBar } from "../components/ActionBar";

export function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? Number(id) : null;
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useBuyerOrder(orderId);
  const [busy, setBusy] = useState(false);

  if (isLoading && !order) {
    return (
      <div className="buyer-page">
        <div className="buyer-surface" style={{ height: 240, background: "var(--buyer-surface-alt)" }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="buyer-page">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="buyer-btn buyer-btn-soft"
          style={{ minHeight: 42, padding: "0 14px", width: "fit-content" }}
        >
          ← Назад
        </button>
        <div
          className="buyer-surface"
          style={{
            marginTop: 12,
            padding: 16,
            background: "var(--buyer-danger-soft)",
            color: "var(--buyer-danger)",
            border: "1px solid rgba(181, 71, 8, 0.2)",
          }}
        >
          Заказ не найден
        </div>
      </div>
    );
  }

  const stage = deriveStage(order);

  const approve = async () => {
    // Без нового backend-endpoint: пока ведём клиента к менеджеру, чтобы зафиксировать согласие.
    setBusy(true);
    try {
      if (order.manager_phone) {
        window.location.href = `tel:${order.manager_phone}`;
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="buyer-page" style={{ paddingBottom: 0 }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          marginInline: -16,
          padding: "12px 16px",
          background: "var(--buyer-surface)",
          borderBottom: "1px solid rgba(26, 34, 45, 0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Назад"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "1px solid rgba(26, 34, 45, 0.08)",
              background: "var(--buyer-surface-alt)",
              color: "var(--buyer-text)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 20 20" width={18} height={18} fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.7 4.3a1 1 0 010 1.4L8.4 10l4.3 4.3a1 1 0 11-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"
              />
            </svg>
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="buyer-text" style={{ fontSize: 13, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Заказ № {order.order_number}
            </div>
            <div className="buyer-muted" style={{ fontSize: 12 }}>
              {fullDate(order.order_date)}
            </div>
          </div>

          <StatusBadge stage={stage} />
        </div>
      </header>

      <div style={{ display: "grid", gap: 12, padding: "16px 0 0" }}>
        <section className="buyer-surface" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <span className="buyer-muted" style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.8, textTransform: "uppercase" }}>
              Сумма
            </span>
            {order.deadline && (
              <span className="buyer-muted" style={{ fontSize: 12 }}>
                до {fullDate(order.deadline)}
              </span>
            )}
          </div>

          <div className="buyer-text" style={{ marginTop: 10, fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>
            {money(order.final_amount)}
          </div>

          <div style={{ marginTop: 14 }}>
            <Timeline current={stage} />
          </div>

          {typeof order.progress === "number" && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {order.status_display && (
                <span className="buyer-muted" style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase" }}>
                  {order.status_display}
                </span>
              )}
              <ProgressBar value={order.progress} status={order.status} height={6} showValue />
            </div>
          )}

          <StageHint stage={stage} />
        </section>

        {order.items && order.items.length > 0 && (
          <section className="buyer-surface" style={{ padding: 16 }}>
            <h2 className="buyer-text" style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
              Состав заказа
            </h2>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
              {order.items.map((it, i) => (
                <li
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderTop: i === 0 ? "none" : "1px solid rgba(26, 34, 45, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="buyer-text" style={{ fontSize: 13, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.model || it.category || "Позиция"}
                    </div>
                    <div className="buyer-muted" style={{ marginTop: 4, fontSize: 12 }}>
                      {it.quantity} {it.unit || "шт"}
                      {it.color ? ` · ${it.color}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <MasterBlock order={order} />
        <DeliveryBlock order={order} />
        <PaymentBlock order={order} />

        <div style={{ paddingBottom: 12 }}>
          <ActionBar order={order} onApprove={approve} busy={busy} />
        </div>
      </div>
    </div>
  );
}

function StageHint({ stage }: { stage: ReturnType<typeof deriveStage> }) {
  const hint: { tone: "warning" | "info" | "success" | "danger"; text: string } | null =
    stage === "approval_pending"
      ? {
          tone: "warning",
          text: "Ждём вашего подтверждения. Проверьте детали и нажмите «Подтвердить заказ».",
        }
      : stage === "in_progress"
        ? {
            tone: "info",
            text: "Заказ в работе. Сообщим, когда он будет готов к отправке.",
          }
        : stage === "completed"
          ? {
              tone: "success",
              text: "Заказ доставлен. Спасибо, что выбрали нас!",
            }
          : stage === "closed"
            ? {
                tone: "success",
                text: "Заказ полностью закрыт.",
              }
            : stage === "cancelled"
              ? {
                  tone: "danger",
                  text: "Заказ отменён.",
                }
              : null;

  if (!hint) return null;

  const bg =
    hint.tone === "warning"
      ? "var(--buyer-warning-soft)"
      : hint.tone === "info"
        ? "var(--buyer-info-soft)"
        : hint.tone === "success"
          ? "var(--buyer-success-soft)"
          : "var(--buyer-danger-soft)";

  const fg =
    hint.tone === "warning"
      ? "var(--buyer-warning)"
      : hint.tone === "info"
        ? "var(--buyer-info)"
        : hint.tone === "success"
          ? "var(--buyer-success)"
          : "var(--buyer-danger)";

  return (
    <div
      style={{
        marginTop: 14,
        borderRadius: 22,
        padding: "12px 14px",
        background: bg,
        color: fg,
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.55,
        border: "1px solid rgba(26, 34, 45, 0.06)",
      }}
    >
      {hint.text}
    </div>
  );
}

