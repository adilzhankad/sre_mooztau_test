import { NEXT_STATUS_LABELS } from "../_constants";
import { ORDER_STATUS_LABELS } from "@/lib/order-helpers";
import type { OrderStatus } from "@/types";

export function OrderContinueProcessButton({
  nextStatus,
  isPending,
  disabled,
  disabledHint,
  onClick,
  size = "xl",
}: {
  nextStatus: OrderStatus;
  isPending: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onClick: () => void;
  size?: "lg" | "xl";
}) {
  const nextLabel = NEXT_STATUS_LABELS[nextStatus] ?? ORDER_STATUS_LABELS[nextStatus];

  return (
    <div className="stack" style={{ gap: 6 }}>
      <button
        type="button"
        className={`btn btn-primary btn-${size}`}
        style={{ width: "100%", justifyContent: "center" }}
        onClick={onClick}
        disabled={disabled || isPending}
        title={disabledHint}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1.1 }}>
          <span>{isPending ? "Processing…" : "Continue Process"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.92 }}>
            → {nextLabel}
          </span>
        </span>
      </button>
      {disabled && disabledHint && (
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "var(--danger-light, #FEE2E2)",
            color: "var(--danger, #B91C1C)",
            fontSize: 11,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {disabledHint}
        </div>
      )}
    </div>
  );
}
