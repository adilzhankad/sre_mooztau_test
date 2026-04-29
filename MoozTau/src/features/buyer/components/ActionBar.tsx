import { useState } from "react";
import type { BuyerOrder } from "@/types";
import { deriveStage, needsBuyerAction } from "../lib/stage";

interface Props {
  order: BuyerOrder;
  onApprove: () => void | Promise<void>;
  busy?: boolean;
}

export function ActionBar({ order, onApprove, busy }: Props) {
  const [showCancel, setShowCancel] = useState(false);
  const stage = deriveStage(order);
  const canApprove = needsBuyerAction(stage);
  const canCancel = ["created", "matching", "master_selected", "approval_pending"].includes(stage);
  const managerPhone = order.manager_phone || null;

  return (
    <>
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 20,
          marginInline: -16,
          padding: "14px 16px calc(var(--safe-bottom, 0px) + 14px)",
          background: "var(--buyer-dock-bg)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {canApprove && (
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="buyer-btn buyer-btn-primary"
              style={{
                width: "100%",
                minHeight: 52,
                fontSize: 15,
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Отправка…" : "Подтвердить заказ"}
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {managerPhone ? (
              <a
                href={`tel:${managerPhone}`}
                className="buyer-btn buyer-btn-secondary"
                style={{
                  minHeight: 46,
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                Связаться
              </a>
            ) : (
              <span
                style={{
                  minHeight: 46,
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  color: "rgba(255, 255, 255, 0.62)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Нет контакта
              </span>
            )}

            {canCancel ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowCancel(true)}
                style={{
                  minHeight: 46,
                  borderRadius: 999,
                  border: "1px solid rgba(255, 156, 128, 0.26)",
                  background: "rgba(255, 156, 128, 0.10)",
                  color: "rgba(255, 255, 255, 0.92)",
                  fontSize: 13,
                  fontWeight: 900,
                  cursor: "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                Отменить
              </button>
            ) : (
              <span
                style={{
                  minHeight: 46,
                  borderRadius: 999,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.10)",
                  color: "rgba(255, 255, 255, 0.62)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Отмена недоступна
              </span>
            )}
          </div>
        </div>
      </div>

      {showCancel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0, 0, 0, 0.4)",
            padding: 16,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowCancel(false)}
        >
          <div
            className="buyer-surface"
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 18,
              borderRadius: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="buyer-text" style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
              Отменить заказ
            </h3>
            <p className="buyer-muted" style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.6 }}>
              Отмену подтверждает менеджер. Позвоните по номеру ниже — поможем оформить отмену сразу.
            </p>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="buyer-btn buyer-btn-soft"
                style={{ minHeight: 46 }}
              >
                Закрыть
              </button>
              {managerPhone ? (
                <a
                  href={`tel:${managerPhone}`}
                  className="buyer-btn buyer-btn-primary"
                  style={{ minHeight: 46, background: "var(--buyer-danger)", color: "white" }}
                >
                  Позвонить
                </a>
              ) : (
                <span
                  style={{
                    minHeight: 46,
                    borderRadius: 999,
                    background: "var(--buyer-surface-muted)",
                    color: "var(--buyer-muted)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Нет контакта
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

