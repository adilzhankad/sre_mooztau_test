import { useMemo } from "react";
import { ORDER_STATUS_BADGE_SIMPLE, ORDER_STATUS_LABELS, displayStatus } from "@/lib/status-config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NEXT_STATUS_LABELS } from "../_constants";
import { OrderContinueProcessButton } from "./OrderContinueProcessButton";
import type { OrderStatus } from "@/types";

const WAITING_ON: Partial<Record<OrderStatus, string>> = {
  qc_review: "QC-инспектор",
  qc_passed: "Логистика",
  waiting_courier: "Логистика",
  accepted: "Покупатель",
};

export function OrderWorkflowCard({
  currentStatus,
  currentStatusDisplay,
  progress,
  primary,
  secondary,
  isPending,
  primaryDisabled,
  primaryDisabledHint,
  onTransition,
}: {
  currentStatus: OrderStatus;
  currentStatusDisplay?: string;
  progress?: number;
  primary: OrderStatus | null;
  secondary: OrderStatus[];
  isPending: boolean;
  primaryDisabled?: boolean;
  primaryDisabledHint?: string;
  onTransition: (status: OrderStatus) => void;
}) {
  const current = useMemo(() => ORDER_STATUS_BADGE_SIMPLE[currentStatus], [currentStatus]);
  const waitingOn = WAITING_ON[currentStatus];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Workflow</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 999,
            background: current.bg,
            color: current.color,
            whiteSpace: "nowrap",
          }}
        >
          {displayStatus(currentStatus, currentStatusDisplay)}
        </span>
      </div>

      {typeof progress === "number" && (
        <div style={{ marginBottom: 10 }}>
          <ProgressBar value={progress} status={currentStatus} height={6} showValue />
        </div>
      )}

      {primary ? (
        <div className="stack" style={{ gap: 10 }}>
          <OrderContinueProcessButton
            nextStatus={primary}
            isPending={isPending}
            disabled={primaryDisabled}
            disabledHint={primaryDisabledHint}
            onClick={() => onTransition(primary)}
          />

          {secondary.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {secondary.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={isPending}
                  onClick={() => onTransition(s)}
                  title={NEXT_STATUS_LABELS[s] ?? ORDER_STATUS_LABELS[s]}
                  style={{ justifyContent: "center" }}
                >
                  {NEXT_STATUS_LABELS[s] ?? ORDER_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "var(--bg-subtle, #F8FAFC)",
            border: "1px dashed var(--border)",
          }}
        >
          <p
            className="text-xs text-muted"
            style={{ margin: 0, marginBottom: waitingOn ? 2 : 0 }}
          >
            Нет действий для вашей роли
          </p>
          {waitingOn && (
            <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
              Ожидает: {waitingOn}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
