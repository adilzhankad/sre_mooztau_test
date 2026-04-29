import type { UserRole } from "@/types";

export function financeTitle(role: UserRole | null) {
  if (role === "DEALER_MANAGER") return "Ваши оплаты и остатки";
  if (role === "DEALER_ADMIN") return "Финансы дилера: оплаты и остатки";
  return "Финансы: деньги и движение средств";
}

export function financeDescription(
  role: UserRole | null,
  fullName: string | null,
  organizationName: string | null,
) {
  if (role === "DEALER_MANAGER") {
    return `${fullName ?? "Менеджер"}, оплаты и остатки по вашим сделкам. Статистика продаж — в разделе «Аналитика».`;
  }
  if (role === "DEALER_ADMIN") {
    return `Деньги по ${organizationName ?? "вашему дилеру"}: получено, остатки и собираемость. Продажи и заказы — в разделе «Аналитика».`;
  }
  return "Доходы и расходы, категории, инициаторы и счета. Заказы и менеджеры — в разделе «Аналитика».";
}
