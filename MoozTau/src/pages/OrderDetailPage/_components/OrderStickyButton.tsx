import { NEXT_STATUS_LABELS } from "../_constants";
import { ORDER_STATUS_LABELS } from "@/lib/order-helpers";
import type { OrderStatus } from "@/types";

interface Props {
  status: OrderStatus;
  isPending: boolean;
  onClick: () => void;
}

export function OrderStickyButton({ status, isPending, onClick }: Props) {
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <button
        className="btn btn-primary btn-xl"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={onClick}
        disabled={isPending}
      >
        {isPending ? "Обработка…" : (NEXT_STATUS_LABELS[status] ?? ORDER_STATUS_LABELS[status])}
      </button>
    </div>
  );
}
