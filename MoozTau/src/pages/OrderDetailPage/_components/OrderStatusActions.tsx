import { NEXT_STATUS_LABELS } from "../_constants";
import { ORDER_STATUS_LABELS } from "@/lib/order-helpers";
import type { OrderStatus } from "@/types";

interface Props {
  dangerTransitions: OrderStatus[];
  statusNote: string;
  isPending: boolean;
  onNoteChange: (note: string) => void;
  onStatusChange: (status: OrderStatus) => void;
}

export function OrderStatusActions({
  dangerTransitions,
  statusNote,
  isPending,
  onNoteChange,
  onStatusChange,
}: Props) {
  if (dangerTransitions.length === 0) return null;

  return (
    <div className="card">
      <p className="card-title" style={{ marginBottom: 10 }}>
        Доп. действия
      </p>

      <input
        className="input"
        placeholder="Комментарий (необязательно)"
        value={statusNote}
        onChange={(e) => onNoteChange(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div className="stack gap-2">
        {dangerTransitions.map((s) => (
          <button
            key={s}
            className="btn btn-secondary btn-sm"
            style={{
              width: "100%",
              justifyContent: "center",
              color: "var(--danger)",
              borderColor: "var(--danger)",
            }}
            onClick={() => onStatusChange(s)}
            disabled={isPending}
          >
            {NEXT_STATUS_LABELS[s] ?? ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
