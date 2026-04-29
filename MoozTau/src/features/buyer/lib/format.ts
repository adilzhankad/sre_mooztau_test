export function money(amount: number | null | undefined, currency = "₸"): string {
  const value = Number(amount ?? 0);
  return `${new Intl.NumberFormat("ru-RU").format(value)} ${currency}`;
}

export function shortDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
}

export function fullDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function orderTitle(items?: { model?: string; category?: string }[]): string {
  if (!items || items.length === 0) return "Заказ";
  const head = items[0];
  const name = head.model || head.category || "Заказ";
  return items.length > 1 ? `${name} +${items.length - 1}` : name;
}

