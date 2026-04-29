import type { OrderStatus } from "@/types";
import { PROGRESS_BUCKET_COLOR, progressBucket } from "@/lib/status-config";

interface Props {
  /** 0..100. Comes from backend `order.progress`. */
  value: number | null | undefined;
  /** Order status — used so cancelled/rejected go to the "stopped" tone. */
  status?: OrderStatus;
  height?: number;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({ value, status, height = 6, showValue = false, className = "" }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value ?? 0)));
  const color = PROGRESS_BUCKET_COLOR[progressBucket(pct, status)];

  return (
    <div className={className} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: 999,
          background: "rgba(148,163,184,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width .3s ease",
          }}
        />
      </div>
      {showValue && (
        <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32, textAlign: "right" }}>
          {pct}%
        </span>
      )}
    </div>
  );
}
