import type { OrderStatus, PaymentStatus } from "@/types";
import i18n from "@/i18n";

// ── Canonical labels (i18n-aware) ────────────────────────────────────────────
// These are proxies backed by the i18n catalog so callers can keep using
// `ORDER_STATUS_LABELS[status]` syntax and get the currently selected language.

function makeLabelProxy<K extends string>(ns: string): Record<K, string> {
  return new Proxy({} as Record<K, string>, {
    get: (_target, prop: string) => i18n.t(`${ns}.${prop}`),
    ownKeys: () => {
      const bundle = i18n.getResourceBundle(i18n.resolvedLanguage ?? "ru", "translation") ?? {};
      return Object.keys((bundle[ns] as Record<string, string>) ?? {});
    },
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
}

export const ORDER_STATUS_LABELS = makeLabelProxy<OrderStatus>("orderStatus");
export const PAYMENT_STATUS_LABELS = makeLabelProxy<PaymentStatus>("paymentStatus");
export const BUYER_STATUS_LABELS = makeLabelProxy<OrderStatus>("buyerStatus");

export function orderStatusLabel(status: OrderStatus): string {
  return i18n.t(`orderStatus.${status}`);
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return i18n.t(`paymentStatus.${status}`);
}

export function buyerStatusLabel(status: OrderStatus): string {
  return i18n.t(`buyerStatus.${status}`);
}

// ── Status colors (hex) ──────────────────────────────────────────────────────

export const STATUS_COLORS: Record<OrderStatus, string> = {
  analysis:        "#6B7280",
  in_progress:     "#3B82F6",
  qc_review:       "#F59E0B",
  qc_passed:       "#10B981",
  qc_rejected:     "#EF4444",
  waiting_courier: "#8B5CF6",
  matching:        "#A855F7",
  master_selected: "#0EA5E9",
  in_transit:      "#06B6D4",
  accepted:        "#22C55E",
  completed:       "#16A34A",
  returned:        "#F97316",
  cancelled:       "#64748B",
  rejected:        "#DC2626",
};

// ── List-view badge (with dot indicator) ─────────────────────────────────────

export const ORDER_STATUS_BADGE: Record<
  OrderStatus,
  { bg: string; color: string; dot: string }
> = {
  analysis:        { bg: "#F3F4F6", color: "#374151", dot: "#6B7280" },
  in_progress:     { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
  qc_review:       { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  qc_passed:       { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  qc_rejected:     { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
  waiting_courier: { bg: "#EDE9FE", color: "#6D28D9", dot: "#8B5CF6" },
  matching:        { bg: "#F3E8FF", color: "#7E22CE", dot: "#A855F7" },
  master_selected: { bg: "#E0F2FE", color: "#0369A1", dot: "#0EA5E9" },
  in_transit:      { bg: "#CFFAFE", color: "#0E7490", dot: "#06B6D4" },
  accepted:        { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
  completed:       { bg: "#BBF7D0", color: "#166534", dot: "#16A34A" },
  returned:        { bg: "#FFEDD5", color: "#C2410C", dot: "#F97316" },
  cancelled:       { bg: "#E2E8F0", color: "#475569", dot: "#64748B" },
  rejected:        { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
};

export const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  { bg: string; color: string; dot: string }
> = {
  partial:  { bg: "#F3F4F6", color: "#374151", dot: "#6B7280" },
  returned: { bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
  prepaid:  { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
  paid:     { bg: "#DCFCE7", color: "#16A34A", dot: "#22C55E" },
};

// ── Detail-view badge (compact, no dot) ──────────────────────────────────────

export const ORDER_STATUS_BADGE_SIMPLE: Record<
  OrderStatus,
  { bg: string; color: string }
> = {
  analysis:        { bg: "#f3f4f6", color: "#374151" },
  in_progress:     { bg: "#dbeafe", color: "#1d4ed8" },
  qc_review:       { bg: "#fef3c7", color: "#92400e" },
  qc_passed:       { bg: "#d1fae5", color: "#065f46" },
  qc_rejected:     { bg: "#fee2e2", color: "#b91c1c" },
  waiting_courier: { bg: "#ede9fe", color: "#6d28d9" },
  matching:        { bg: "#f3e8ff", color: "#7e22ce" },
  master_selected: { bg: "#e0f2fe", color: "#0369a1" },
  in_transit:      { bg: "#cffafe", color: "#0e7490" },
  accepted:        { bg: "#dcfce7", color: "#15803d" },
  completed:       { bg: "#bbf7d0", color: "#166534" },
  returned:        { bg: "#ffedd5", color: "#c2410c" },
  cancelled:       { bg: "#e2e8f0", color: "#475569" },
  rejected:        { bg: "#fee2e2", color: "#991b1b" },
};

export const PAYMENT_STATUS_BADGE_SIMPLE: Record<
  PaymentStatus,
  { bg: string; color: string }
> = {
  partial:  { bg: "#f3f4f6", color: "#374151" },
  returned: { bg: "#fee2e2", color: "#991b1b" },
  prepaid:  { bg: "#dbeafe", color: "#1d4ed8" },
  paid:     { bg: "#dcfce7", color: "#16a34a" },
};

// ── Mobile card accent bar color ─────────────────────────────────────────────

export const ORDER_STATUS_BAR: Record<OrderStatus, string> = {
  analysis:        "#6B7280",
  in_progress:     "#3B82F6",
  qc_review:       "#F59E0B",
  qc_passed:       "#10B981",
  qc_rejected:     "#EF4444",
  waiting_courier: "#8B5CF6",
  matching:        "#A855F7",
  master_selected: "#0EA5E9",
  in_transit:      "#06B6D4",
  accepted:        "#22C55E",
  completed:       "#16A34A",
  returned:        "#F97316",
  cancelled:       "#64748B",
  rejected:        "#DC2626",
};

export const PAYMENT_STATUS_BAR: Record<PaymentStatus, string> = {
  partial:  "#6B7280",
  returned: "#DC2626",
  prepaid:  "#3B82F6",
  paid:     "#22C55E",
};

// ── Filter pill active appearance ────────────────────────────────────────────

export const ORDER_STATUS_PILL_ACTIVE: Record<
  string,
  { bg: string; color: string }
> = {
  "":              { bg: "var(--primary)", color: "#fff" },
  analysis:        { bg: "#6B7280", color: "#fff" },
  in_progress:     { bg: "#3B82F6", color: "#fff" },
  qc_review:       { bg: "#F59E0B", color: "#fff" },
  qc_passed:       { bg: "#10B981", color: "#fff" },
  qc_rejected:     { bg: "#EF4444", color: "#fff" },
  waiting_courier: { bg: "#8B5CF6", color: "#fff" },
  matching:        { bg: "#A855F7", color: "#fff" },
  master_selected: { bg: "#0EA5E9", color: "#fff" },
  in_transit:      { bg: "#06B6D4", color: "#fff" },
  accepted:        { bg: "#22C55E", color: "#fff" },
  completed:       { bg: "#16A34A", color: "#fff" },
  returned:        { bg: "#F97316", color: "#fff" },
  cancelled:       { bg: "#64748B", color: "#fff" },
  rejected:        { bg: "#DC2626", color: "#fff" },
};

export const PAYMENT_STATUS_PILL_ACTIVE: Record<
  string,
  { bg: string; color: string }
> = {
  partial:  { bg: "#6B7280", color: "#fff" },
  returned: { bg: "#DC2626", color: "#fff" },
  prepaid:  { bg: "#3B82F6", color: "#fff" },
  paid:     { bg: "#22C55E", color: "#fff" },
};

// ── Stepper order (main flow, excluding branches) ────────────────────────────

export const STEPPER_STATUSES: OrderStatus[] = [
  "analysis",
  "in_progress",
  "qc_review",
  "qc_passed",
  "waiting_courier",
  "in_transit",
  "completed",
];

// Stepper used when the order is in matching mode (inDriver-style)
export const MATCHING_STEPPER_STATUSES: OrderStatus[] = [
  "analysis",
  "in_progress",
  "qc_review",
  "qc_passed",
  "waiting_courier",
  "matching",
  "master_selected",
  "in_transit",
  "completed",
];

// Buyer simplified stepper (labels built from i18n at call time)
export const BUYER_STEPPER_KEYS = [
  "in_work",
  "ready_to_ship",
  "in_transit",
  "completed",
] as const;

export function buyerStepperLabels(): string[] {
  return BUYER_STEPPER_KEYS.map((key) => i18n.t(`buyerStatus.stepper.${key}`));
}

// Back-compat: raw russian labels kept for spots that compare strings directly.
export const BUYER_STEPPER_STATUSES = [
  "В работе",
  "Готов к отправке",
  "В пути",
  "Завершён",
] as const;

// ── Status display helper ────────────────────────────────────────────────────
//
// Backend (v4) returns `status_display` already localized for the caller's role.
// `displayStatus` prefers it, falling back to local i18n labels for older
// payloads that don't carry the new field.
export function displayStatus(
  status: OrderStatus,
  statusDisplay?: string | null,
): string {
  if (statusDisplay && statusDisplay.trim()) return statusDisplay;
  return ORDER_STATUS_LABELS[status] ?? status;
}

// ── Progress bucket helper (backend `progress` is 0..100, role-agnostic) ─────

export type ProgressBucket = "stopped" | "in_work" | "delivery" | "ready";

export function progressBucket(progress: number | null | undefined, status?: OrderStatus): ProgressBucket {
  if (status === "cancelled" || status === "rejected") return "stopped";
  const p = typeof progress === "number" ? progress : 0;
  if (p === 0) return "stopped";
  if (p >= 85) return "ready";
  if (p >= 60) return "delivery";
  return "in_work";
}

export const PROGRESS_BUCKET_COLOR: Record<ProgressBucket, string> = {
  stopped:  "#94A3B8",
  in_work:  "#3B82F6",
  delivery: "#A855F7",
  ready:    "#22C55E",
};
