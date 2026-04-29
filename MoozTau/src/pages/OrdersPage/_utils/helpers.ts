import i18n from "@/i18n";
import type { Order, OrderStatus } from "@/types";

export function getSortOptions(): { value: string; label: string }[] {
  return [
    { value: "-order_date", label: i18n.t("ordersPage.sort.newest") },
    { value: "order_date", label: i18n.t("ordersPage.sort.oldest") },
    { value: "-total_amount", label: i18n.t("ordersPage.sort.amountDesc") },
    { value: "total_amount", label: i18n.t("ordersPage.sort.amountAsc") },
  ];
}

// Backward-compat proxy: old imports `SORT_OPTIONS` still work and re-read current language.
export const SORT_OPTIONS = new Proxy([] as { value: string; label: string }[], {
  get(_t, prop) {
    const list = getSortOptions();
    return (list as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const ACTIVE_STATUSES: OrderStatus[] = [
  "in_progress",
  "qc_review",
  "waiting_courier",
  "in_transit",
  "completed",
];

export const ARCHIVE_STATUSES: OrderStatus[] = [
  "returned",
  "cancelled",
  "rejected",
];

export const COUNTER_STATUSES: OrderStatus[] = [
  ...ACTIVE_STATUSES,
  ...ARCHIVE_STATUSES,
];

export function itemsSummary(items: Order["items"]): string {
  if (!items || items.length === 0) return i18n.t("common.dash");
  if (items.length === 1) return items[0].model;
  return `${items[0].model} +${items.length - 1}`;
}
