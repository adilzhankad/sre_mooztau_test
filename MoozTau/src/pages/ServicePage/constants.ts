import i18n from "@/i18n";
import type { ServiceRequestStatus } from "@/types";

export const SERVICE_STATUS_LABELS: Record<ServiceRequestStatus, string> = new Proxy(
  {} as Record<ServiceRequestStatus, string>,
  {
    get: (_t, prop: string) => i18n.t(`serviceStatus.${prop}`),
  },
);

export const SERVICE_STATUS_COLORS: Record<ServiceRequestStatus, string> = {
  new: "#2067b0",
  matching: "#a855f7",
  master_selected: "#0ea5e9",
  approval_pending: "#f97316",
  approved: "#22c55e",
  in_progress: "#f59e0b",
  waiting_parts: "#7c3aed",
  completed: "#16a34a",
  closed: "#15803d",
  cancelled: "#ef4444",
};

export const SERVICE_STATUS_OPTIONS: ServiceRequestStatus[] = [
  "new",
  "matching",
  "master_selected",
  "approval_pending",
  "approved",
  "in_progress",
  "waiting_parts",
  "completed",
  "closed",
  "cancelled",
];

// Allowed transitions per current status (mirrors backend rules — backend is the
// source of truth, this just disables invalid options in the UI).
export const SERVICE_ALLOWED_NEXT: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
  new: ["matching", "master_selected", "cancelled"],
  matching: ["master_selected", "cancelled"],
  master_selected: ["approval_pending", "approved", "in_progress", "cancelled"],
  approval_pending: ["approved", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["waiting_parts", "completed", "cancelled"],
  waiting_parts: ["in_progress", "cancelled"],
  completed: ["closed"],
  closed: [],
  cancelled: [],
};
