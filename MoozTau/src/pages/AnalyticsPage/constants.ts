import type { UserRole } from "@/types";

export const COMMERCIAL_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "DEALER_ADMIN",
  "DEALER_MANAGER",
];

export function heroTitle(role: UserRole | null) {
  if (role === "DEALER_ADMIN") return "Аналитика продаж по вашему дилеру";
  if (role === "DEALER_MANAGER") return "Ваши продажи и воронка";
  if (role === "FACTORY_ADMIN") return "Производственный дашборд цеха";
  if (role === "QC_INSPECTOR") return "Контроль качества и узкие места";
  if (role === "LOGISTICS") return "Доставка и отгрузка под контролем";
  return "Аналитика продаж и заказов";
}

export function heroDescription(
  role: UserRole | null,
  fullName: string | null,
  organizationName: string | null,
) {
  if (role === "DEALER_ADMIN") {
    return `Заказы и продажи по ${organizationName ?? "вашей организации"}: выручка, статусы, менеджеры и товары. Денежные потоки — в разделе «Финансы».`;
  }
  if (role === "DEALER_MANAGER") {
    return `${fullName ?? "Менеджер"}, только ваши заказы и воронка продаж. Оплаты по вашим сделкам — в разделе «Финансы».`;
  }
  if (role === "FACTORY_ADMIN") {
    return "Фокус на производстве: загрузка, QC, очередь и регионы, которые сильнее всего нагружают цех.";
  }
  if (role === "QC_INSPECTOR") {
    return "Приоритетные показатели по очереди QC, проценту отклонений и проблемным заказам.";
  }
  if (role === "LOGISTICS") {
    return "Операционный экран логистики: отгрузка, доставка и регионы с максимальной нагрузкой.";
  }
  return "Продажи, заказы, менеджеры, товары и каналы. Денежные потоки и баланс счетов — в разделе «Финансы».";
}
