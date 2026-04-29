import type { AuditAction, AuditResourceType } from "@/types";

export const ACTION_LABELS: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Обновление",
  DELETE: "Удаление",
  STATUS_CHANGE: "Смена статуса",
  LOGIN: "Вход",
  VIEW: "Просмотр",
};

export const RESOURCE_LABELS: Record<string, string> = {
  order: "Заказ",
  qc_check: "QC проверка",
  transaction: "Транзакция",
  product: "Продукт",
  user: "Пользователь",
  inventory: "Склад",
  organization: "Организация",
  auth: "Авторизация",
};

export const ACTION_COLORS: Record<string, string> = {
  CREATE: "#22c55e",
  UPDATE: "#2067b0",
  DELETE: "#ef4444",
  STATUS_CHANGE: "#f59e0b",
  LOGIN: "#7c3aed",
  VIEW: "#6b7280",
};

export const AUDIT_ACTION_OPTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "LOGIN",
  "VIEW",
];

export const AUDIT_RESOURCE_OPTIONS: AuditResourceType[] = [
  "order",
  "qc_check",
  "transaction",
  "product",
  "user",
  "inventory",
  "organization",
  "auth",
];
