import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { OrderStatus } from "@/types";

interface Props {
  orderNumber: string;
  status: OrderStatus;
  statusDisplay?: string;
  progress?: number;
  salesChannel?: string | null;
}

export function OrderHeader({ orderNumber, status, statusDisplay, progress, salesChannel }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mobile-header" style={{ flexWrap: "wrap", gap: "6px 10px" }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-icon-sm"
        style={{ flexShrink: 0 }}
      >
        <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="text-md font-semibold truncate" style={{ display: "block" }}>
          {orderNumber}
        </span>
        {salesChannel && (
          <span className="text-xs text-secondary" style={{ display: "block", marginTop: 1 }}>
            {salesChannel}
          </span>
        )}
        {typeof progress === "number" && (
          <ProgressBar value={progress} status={status} height={4} />
        )}
      </div>

      <StatusBadge status={status} display={statusDisplay} />
    </div>
  );
}
