import type { OrderStatus, BuyerOrder } from "@/types";

export type BuyerStage =
  | "created"
  | "matching"
  | "master_selected"
  | "approval_pending"
  | "approved"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";

export const STAGE_ORDER: BuyerStage[] = [
  "created",
  "matching",
  "master_selected",
  "approval_pending",
  "approved",
  "in_progress",
  "completed",
  "closed",
];

export const STAGE_LABEL: Record<BuyerStage, string> = {
  created: "Создан",
  matching: "Подбор",
  master_selected: "Исполнитель",
  approval_pending: "Подтверждение",
  approved: "Одобрен",
  in_progress: "В работе",
  completed: "Выполнен",
  closed: "Закрыт",
  cancelled: "Отменён",
};

export type StageTone = {
  bg: string;
  fg: string;
  dot: string;
  border: string;
};

export const STAGE_TONE: Record<BuyerStage, StageTone> = {
  created: {
    bg: "var(--buyer-surface-muted)",
    fg: "var(--buyer-muted)",
    dot: "var(--buyer-muted)",
    border: "rgba(102, 112, 133, 0.22)",
  },
  matching: {
    bg: "var(--buyer-warning-soft)",
    fg: "var(--buyer-warning)",
    dot: "var(--buyer-warning)",
    border: "rgba(161, 92, 7, 0.22)",
  },
  master_selected: {
    bg: "var(--buyer-info-soft)",
    fg: "var(--buyer-info)",
    dot: "var(--buyer-info)",
    border: "rgba(21, 91, 117, 0.22)",
  },
  approval_pending: {
    bg: "var(--buyer-danger-soft)",
    fg: "var(--buyer-danger)",
    dot: "var(--buyer-danger)",
    border: "rgba(181, 71, 8, 0.22)",
  },
  approved: {
    bg: "var(--buyer-accent-soft)",
    fg: "var(--buyer-accent-deep)",
    dot: "var(--buyer-accent)",
    border: "rgba(166, 202, 57, 0.26)",
  },
  in_progress: {
    bg: "var(--buyer-info-soft)",
    fg: "var(--buyer-info)",
    dot: "var(--buyer-info)",
    border: "rgba(21, 91, 117, 0.22)",
  },
  completed: {
    bg: "var(--buyer-success-soft)",
    fg: "var(--buyer-success)",
    dot: "var(--buyer-success)",
    border: "rgba(2, 122, 72, 0.22)",
  },
  closed: {
    bg: "var(--buyer-success-soft)",
    fg: "var(--buyer-success)",
    dot: "var(--buyer-success)",
    border: "rgba(2, 122, 72, 0.22)",
  },
  cancelled: {
    bg: "var(--buyer-surface-muted)",
    fg: "var(--buyer-muted)",
    dot: "var(--buyer-muted)",
    border: "rgba(102, 112, 133, 0.22)",
  },
};

/** Map existing OrderStatus (backend) → buyer-facing Stage (frontend only). */
export function deriveStage(order: Pick<
  BuyerOrder,
  "status" | "contract_status" | "has_contract" | "payment_received" | "final_amount" | "completed_at"
>): BuyerStage {
  const status: OrderStatus = order.status;

  if (status === "cancelled" || status === "rejected") return "cancelled";
  if (status === "returned") return "cancelled";

  if (status === "completed" || status === "accepted") {
    const fullyPaid = order.final_amount > 0 && order.payment_received >= order.final_amount;
    return fullyPaid ? "closed" : "completed";
  }

  if (status === "matching") return "matching";
  if (status === "master_selected") return "master_selected";

  if (
    status === "in_progress" ||
    status === "qc_review" ||
    status === "qc_passed" ||
    status === "qc_rejected" ||
    status === "waiting_courier" ||
    status === "in_transit"
  ) {
    return "in_progress";
  }

  // analysis → развилка по наличию договора
  if (status === "analysis") {
    if (order.has_contract) {
      if (order.contract_status === "signed") return "approved";
      if (order.contract_status === "scanned" || order.contract_status === "created") {
        return "approval_pending";
      }
    }
    return "created";
  }

  return "created";
}

export function stageIndex(stage: BuyerStage): number {
  const index = STAGE_ORDER.indexOf(stage);
  return index === -1 ? 0 : index;
}

export function needsBuyerAction(stage: BuyerStage): boolean {
  return stage === "approval_pending";
}

