import type { UserRole } from "@/types";
import i18n from "@/i18n";

export const ROLE_LABELS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string) => i18n.t(`role.${prop}`),
});

export const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "badge-super",
  DEALER_ADMIN: "badge-dealer-admin",
  DEALER_MANAGER: "badge-manager",
  FACTORY_ADMIN: "badge-factory",
  FACTORY_WORKER: "badge-neutral",
  QC_INSPECTOR: "badge-qc",
  LOGISTICS: "badge-factory",
  BUYER: "badge-buyer",
  MASTER: "badge-qc",
};

export const ROLE_FILTER_ORDER: UserRole[] = [
  "SUPER_ADMIN",
  "DEALER_ADMIN",
  "DEALER_MANAGER",
  "FACTORY_ADMIN",
  "FACTORY_WORKER",
  "QC_INSPECTOR",
  "LOGISTICS",
  "MASTER",
  "BUYER",
];
