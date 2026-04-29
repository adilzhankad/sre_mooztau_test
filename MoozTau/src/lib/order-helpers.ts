// Re-export canonical labels from the single source of truth
export { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/status-config";

import type { OrderStatus, PaymentStatus } from "@/types";

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  analysis:        "bg-gray-100 text-gray-700",
  in_progress:     "bg-blue-100 text-blue-700",
  qc_review:       "bg-amber-100 text-amber-700",
  qc_passed:       "bg-emerald-100 text-emerald-700",
  qc_rejected:     "bg-red-100 text-red-700",
  waiting_courier: "bg-violet-100 text-violet-700",
  matching:        "bg-purple-100 text-purple-700",
  master_selected: "bg-sky-100 text-sky-700",
  in_transit:      "bg-cyan-100 text-cyan-700",
  accepted:        "bg-green-100 text-green-700",
  completed:       "bg-green-200 text-green-800",
  returned:        "bg-orange-100 text-orange-700",
  cancelled:       "bg-slate-100 text-slate-700",
  rejected:        "bg-red-100 text-red-700",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  partial:  "bg-gray-100 text-gray-600",
  returned: "bg-red-100 text-red-700",
  prepaid:  "bg-blue-100 text-blue-700",
  paid:     "bg-green-100 text-green-700",
};

export function formatMoney(amount: number | string | null | undefined): string {
  const value = typeof amount === "number" ? amount : Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-KZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ru-KZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
