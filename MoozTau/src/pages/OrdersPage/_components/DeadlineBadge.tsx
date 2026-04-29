import { useTranslation } from "react-i18next";
import { getDeadlineState } from "@/lib/deadlines";
import type { Order } from "@/types";

interface Props {
  order: Order;
  compact?: boolean;
}

const DAY_MS = 86_400_000;

function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function daysBetween(deadline: string): number {
  return Math.ceil((parseDate(deadline).getTime() - Date.now()) / DAY_MS);
}

export function DeadlineBadge({ order, compact = false }: Props) {
  const { t } = useTranslation();
  if (!order.deadline) return null;

  const state = getDeadlineState(order);
  if (!state) return null;

  if (state.kind === "completed") {
    return (
      <span
        className="tabnum"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          background:
            state.tone === "warning" ? "#FEF3C7" : "#DCFCE7",
          color:
            state.tone === "warning" ? "#A16207" : "#166534",
        }}
        title={`${state.durationLabel}. ${state.timingLabel}`}
      >
        {state.timingLabel}
      </span>
    );
  }

  const diff = daysBetween(order.deadline);
  const isOverdue = diff < 0;
  const isToday = diff === 0;

  const label = isOverdue
    ? compact
      ? t("ordersPage.deadline.overdueShort", { count: Math.abs(diff) })
      : t("ordersPage.deadline.overdue", { count: Math.abs(diff) })
    : isToday
      ? t("ordersPage.deadline.today")
      : t("ordersPage.deadline.daysLeft", { count: diff });

  const bg =
    state.tone === "danger"
      ? "#FEE2E2"
      : state.tone === "warning"
        ? "#FEF3C7"
        : "#F1F5F9";
  const color =
    state.tone === "danger"
      ? "#B91C1C"
      : state.tone === "warning"
        ? "#A16207"
        : "#475569";

  return (
    <span
      className="tabnum"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
      title={state.countdown}
    >
      {label}
    </span>
  );
}
