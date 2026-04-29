import type { AnyOrderStatus } from "@/types";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABELS, PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABELS } from "@/lib/status-config";

interface Props {
  status: AnyOrderStatus;
  /** Backend-provided role-aware label (status_display). Falls back to local i18n. */
  display?: string | null;
  size?: "sm" | "md";
}

export function StatusBadge({ status, display, size = "md" }: Props) {
  const s = (ORDER_STATUS_BADGE as Record<string, typeof ORDER_STATUS_BADGE.analysis>)[status]
    ?? (PAYMENT_STATUS_BADGE as Record<string, typeof ORDER_STATUS_BADGE.analysis>)[status]
    ?? ORDER_STATUS_BADGE.analysis;
  const isSm = size === "sm";

  const label = display && display.trim()
    ? display
    : (ORDER_STATUS_LABELS as Record<string, string>)[status]
      ?? (PAYMENT_STATUS_LABELS as Record<string, string>)[status]
      ?? status;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 4 : 5,
        padding: isSm ? "2px 7px" : "3px 8px",
        borderRadius: 999,
        fontSize: isSm ? 11 : 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
