import { formatMoney } from "@/lib/order-helpers";

interface SummaryBlockProps {
  totalAmount: number;
  deadline: string;
  setDeadline: (v: string) => void;
}

export function SummaryBlock({
  totalAmount,
  deadline,
  setDeadline,
}: SummaryBlockProps) {
  const setRelativeDate = (days: number, months = 0) => {
    const date = new Date();
    if (months) {
      date.setMonth(date.getMonth() + months);
    } else {
      date.setDate(date.getDate() + days);
    }
    setDeadline(date.toISOString().split("T")[0]);
  };

  return (
    <div className="card">
      <p className="card-title" style={{ marginBottom: 14 }}>
        Итог
      </p>

      <div
        className="row-between"
        style={{
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <span className="text-sm font-semibold text-secondary">
          Итого по заказу
        </span>
        <span className="text-2xl font-bold text-brand tabnum">
          {formatMoney(totalAmount)}
        </span>
      </div>

      <label
        className="form-label"
        style={{ display: "block", marginBottom: 10 }}
      >
        Дедлайн
      </label>

      <div
        className="row"
        style={{ gap: 6, marginBottom: 12, flexWrap: "wrap" }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setRelativeDate(1)}
        >
          +1 дн
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setRelativeDate(3)}
        >
          +3 дн
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setRelativeDate(7)}
        >
          Неделя
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setRelativeDate(0, 1)}
        >
          +Месяц
        </button>
      </div>

      <div style={{ position: "relative" }}>
        <input
          type="date"
          className="input"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ width: "100%", paddingLeft: 40, cursor: "pointer" }}
        />
        <CalendarIcon />
        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            position: absolute; left: 0; top: 0;
            width: 100%; height: 100%;
            margin: 0; padding: 0;
            cursor: pointer; opacity: 0;
          }
        `}</style>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "var(--text-muted)",
      }}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
