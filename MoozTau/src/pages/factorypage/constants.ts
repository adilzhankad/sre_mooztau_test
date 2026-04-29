import type { FactoryDashboard } from "@/types";

export const FACTORY_STATUS_OPTIONS = [
  { value: "", label: "Все статусы" },
  { value: "in_progress", label: "В работе" },
  { value: "qc_review", label: "На QC" },
  { value: "qc_passed", label: "QC пройден" },
  { value: "qc_rejected", label: "На доработке" },
  { value: "waiting_courier", label: "Ожидает курьера" },
] as const;

export const INVENTORY_STATUS_OPTIONS = [
  { value: "", label: "Любой статус" },
  { value: "in_stock", label: "На складе" },
  { value: "reserved", label: "Зарезервировано" },
  { value: "shipped", label: "Отгружено" },
] as const;

export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  in_stock: "На складе",
  reserved: "Зарезервировано",
  shipped: "Отгружено",
};

export const DASHBOARD_CARDS: Array<{
  key: keyof FactoryDashboard;
  label: string;
  color: string;
}> = [
  { key: "total_orders", label: "Всего в контуре", color: "#475569" },
  { key: "in_progress", label: "В производстве", color: "#2563EB" },
  { key: "qc_review", label: "Очередь QC", color: "#D97706" },
  { key: "qc_passed", label: "QC подтвержден", color: "#059669" },
  { key: "qc_rejected", label: "Вернули в цех", color: "#DC2626" },
  { key: "waiting_courier", label: "Готово к отгрузке", color: "#7C3AED" },
];
