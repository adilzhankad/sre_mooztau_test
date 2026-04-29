import type { Order } from "@/types";

type DeadlineTone = "danger" | "warning" | "success" | "neutral";

export interface ActiveDeadlineState {
  kind: "active";
  tone: DeadlineTone;
  label: string;
  blink?: boolean;
  countdown: string;
}

export interface CompletedDeadlineState {
  kind: "completed";
  tone: DeadlineTone;
  label: string;
  durationLabel: string;
  timingLabel: string;
}

export type DeadlineState = ActiveDeadlineState | CompletedDeadlineState;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function parseAnyDate(value: string): Date {
  return value.includes("T") ? new Date(value) : parseDateOnly(value);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffCalendarDays(a: Date, b: Date): number {
  return Math.round((startOfLocalDay(a).getTime() - startOfLocalDay(b).getTime()) / DAY_MS);
}

function formatCountdown(deadline: string): string {
  const diff = parseDateOnly(deadline).getTime() + DAY_MS - Date.now();
  if (diff <= 0) return "0д 0ч 0м 0с";

  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  return `${days}д ${totalHours % 24}ч ${totalMinutes % 60}м ${totalSeconds % 60}с`;
}

function getCompletionDate(order: Order): Date | null {
  if (order.completed_at) return parseAnyDate(order.completed_at);
  if (order.accepted_date) return parseAnyDate(order.accepted_date);
  return null;
}

export function getDeadlineState(order: Order): DeadlineState | null {
  if (!order.deadline) return null;

  const completionDate = getCompletionDate(order);
  if (order.status === "completed" && completionDate) {
    const durationDays = Math.max(1, diffCalendarDays(completionDate, parseDateOnly(order.order_date)) + 1);
    const deltaDays = diffCalendarDays(completionDate, parseDateOnly(order.deadline));

    let tone: DeadlineTone = "success";
    let timingLabel = "В срок";

    if (deltaDays < 0) {
      timingLabel = `На ${Math.abs(deltaDays)}д раньше дедлайна`;
    } else if (deltaDays > 0) {
      tone = "warning";
      timingLabel = `На ${deltaDays}д позже дедлайна`;
    }

    return {
      kind: "completed",
      tone,
      label: "Выполнен",
      durationLabel: `За ${durationDays}д`,
      timingLabel,
    };
  }

  const diffDays = Math.ceil((parseDateOnly(order.deadline).getTime() - Date.now()) / DAY_MS);

  if (diffDays < 0) {
    return {
      kind: "active",
      tone: "danger",
      label: `Просрочен на ${Math.abs(diffDays)}д`,
      blink: true,
      countdown: formatCountdown(order.deadline),
    };
  }

  if (diffDays === 0) {
    return {
      kind: "active",
      tone: "danger",
      label: "Дедлайн сегодня",
      blink: true,
      countdown: formatCountdown(order.deadline),
    };
  }

  if (diffDays <= 3) {
    return {
      kind: "active",
      tone: "warning",
      label: "Скоро дедлайн",
      countdown: formatCountdown(order.deadline),
    };
  }

  return {
    kind: "active",
    tone: "success",
    label: "Есть время",
    countdown: formatCountdown(order.deadline),
  };
}
