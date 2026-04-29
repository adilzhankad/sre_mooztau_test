import type { OrderStatus } from "@/types";
import { ORDER_STATUS_BADGE_SIMPLE } from "@/lib/status-config";

// Re-export under the name used by OrderDetailPage components
export { ORDER_STATUS_BADGE_SIMPLE as STATUS_BADGE_STYLES };

export const TRANSITIONS: Partial<
  Record<string, Partial<Record<OrderStatus, OrderStatus[]>>>
> = {
  SUPER_ADMIN: {
    analysis: ["in_progress", "cancelled", "rejected"],
    in_progress: ["cancelled"],
    qc_review: ["cancelled"],
    qc_passed: ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit: ["completed", "returned", "cancelled"],
    accepted: ["completed"],
    completed: ["returned"],
  },
  DEALER_ADMIN: {
    analysis: ["in_progress", "cancelled"],
    in_progress: ["cancelled"],
    qc_review: ["cancelled"],
    qc_passed: ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit: ["completed", "returned", "cancelled"],
    accepted: ["completed"],
    completed: ["returned"],
  },
  DEALER_MANAGER: {
    analysis: ["in_progress", "cancelled"],
    in_progress: ["cancelled"],
    qc_review: ["cancelled"],
    qc_passed: ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit: ["completed", "returned", "cancelled"],
    accepted: ["completed"],
    completed: ["returned"],
  },
  FACTORY_ADMIN: {
    in_progress: ["qc_review"],
    qc_passed: ["waiting_courier"],
    qc_rejected: ["in_progress"],
  },
  FACTORY_WORKER: {
    in_progress: ["qc_review"],
    qc_rejected: ["in_progress"],
  },
  QC_INSPECTOR: {
    qc_review: ["qc_passed", "qc_rejected"],
  },
  LOGISTICS: {
    waiting_courier: ["in_transit"],
    in_transit:      ["completed"],
  },
};

export const NEXT_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  in_progress:     "Взять в работу",
  qc_review:       "Передать на QC",
  qc_passed:       "QC Пройден",
  qc_rejected:     "Вернуть на доработку",
  waiting_courier: "Готов к отгрузке",
  in_transit:      "Отгрузить",
  completed:       "Завершить",
  returned:        "Оформить возврат",
  cancelled:       "Отменить",
  rejected:        "Отклонить",
};
