import type { UserRole, OrderStatus } from "@/types";

// ── Role predicates ───────────────────────────────────────────────────────────

export function isSuperAdmin(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function isDealerAdmin(role: UserRole | null | undefined): boolean {
  return role === "DEALER_ADMIN";
}

export function isDealerManager(role: UserRole | null | undefined): boolean {
  return role === "DEALER_MANAGER";
}

export function isMaster(role: UserRole | null | undefined): boolean {
  return role === "MASTER";
}

export function isDealerRole(role: UserRole | null | undefined): boolean {
  return role === "DEALER_ADMIN" || role === "DEALER_MANAGER";
}

export function isFactoryRole(role: UserRole | null | undefined): boolean {
  return role === "FACTORY_ADMIN" || role === "FACTORY_WORKER";
}

export function isQCInspector(role: UserRole | null | undefined): boolean {
  return role === "QC_INSPECTOR";
}

export function isLogistics(role: UserRole | null | undefined): boolean {
  return role === "LOGISTICS";
}

export function isBuyer(role: UserRole | null | undefined): boolean {
  return role === "BUYER" || role === "USER";
}

export function isClient(role: UserRole | null | undefined): boolean {
  return role === "BUYER" || role === "USER";
}

// ── Feature-level permissions ─────────────────────────────────────────────────

export function canCreateOrder(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

// ── Payments ────────────────────────────────────────────────────────────────

export function canAddPayment(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

export function canVerifyPayment(role: UserRole | null | undefined): boolean {
  // Four-eyes rule: managers record, admins verify.
  return role === "SUPER_ADMIN" || role === "DEALER_ADMIN";
}

export function canViewPayments(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER" ||
    role === "BUYER" ||
    role === "USER"
  );
}

// ── QC ──────────────────────────────────────────────────────────────────────

export function canPerformQC(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "QC_INSPECTOR";
}

export function canSeeQCQueue(role: UserRole | null | undefined): boolean {
  return canPerformQC(role);
}

// ── Logistics ───────────────────────────────────────────────────────────────

export function canAssignCourier(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "LOGISTICS" || role === "FACTORY_ADMIN";
}

export function canDispatchOrder(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "LOGISTICS";
}

export function canMarkDelivered(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "LOGISTICS" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

// ── Analytics scope ─────────────────────────────────────────────────────────

export function canViewFullAnalytics(role: UserRole | null | undefined): boolean {
  // SUPER_ADMIN sees unscoped data; all others are auto-scoped by the API.
  return role === "SUPER_ADMIN";
}

export function canViewFinancialAnalytics(role: UserRole | null | undefined): boolean {
  // LOGISTICS is the only analytics-capable role blocked from financial KPIs.
  return canViewAnalytics(role) && role !== "LOGISTICS";
}

export function canViewDeliveryAnalytics(role: UserRole | null | undefined): boolean {
  return canViewAnalytics(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "DEALER_ADMIN";
}

export function canManageOrganizations(
  role: UserRole | null | undefined,
): boolean {
  return role === "SUPER_ADMIN";
}

export function canViewAnalytics(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER" ||
    role === "FACTORY_ADMIN" ||
    role === "QC_INSPECTOR" ||
    role === "LOGISTICS"
  );
}

export function canViewFinances(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

export function canViewAudit(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}

export function canViewService(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER" ||
    role === "MASTER"
  );
}

// ── Price visibility ─────────────────────────────────────────────────────────

export function canSeeDealerPrice(role: UserRole | null | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "DEALER_ADMIN";
}

export function canSeeRRP(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

export function canSeeOrderTotal(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER" ||
    role === "BUYER" ||
    role === "USER"
  );
}

export function canSeePrices(role: UserRole | null | undefined): boolean {
  return (
    role === "SUPER_ADMIN" ||
    role === "DEALER_ADMIN" ||
    role === "DEALER_MANAGER"
  );
}

// ── Org/manager scoping ───────────────────────────────────────────────────────

export function orgFilterForRole(
  role: UserRole | null | undefined,
  organizationId: number | null | undefined,
): number | undefined {
  if (role === "DEALER_ADMIN") return organizationId ?? undefined;
  return undefined;
}

export function managerFilterForRole(
  role: UserRole | null | undefined,
  userId: number | null | undefined,
): number | undefined {
  if (role === "DEALER_MANAGER") return userId ?? undefined;
  return undefined;
}

// ── Roles available for user creation ────────────────────────────────────────

export function getCreatableRoles(role: UserRole | null | undefined): UserRole[] {
  if (role === "SUPER_ADMIN") {
    return [
      "SUPER_ADMIN",
      "DEALER_ADMIN",
      "DEALER_MANAGER",
      "MASTER",
      "FACTORY_ADMIN",
      "FACTORY_WORKER",
      "QC_INSPECTOR",
      "LOGISTICS",
    ];
  }
  if (role === "DEALER_ADMIN") {
    return ["DEALER_ADMIN", "DEALER_MANAGER"];
  }
  return [];
}

// ── Status transition matrix (role → current status → allowed next statuses) ─

export const STATUS_TRANSITIONS: Record<string, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  SUPER_ADMIN: {
    analysis:    ["in_progress", "cancelled", "rejected"],
    in_progress: ["cancelled"],
    qc_review:   ["cancelled"],
    qc_passed:   ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit:  ["completed", "returned", "cancelled"],
    accepted:    ["completed"],
    completed:   ["returned"],
  },
  FACTORY_WORKER: {
    in_progress: ["qc_review"],
    qc_rejected: ["in_progress"],
  },
  FACTORY_ADMIN: {
    in_progress:  ["qc_review"],
    qc_passed:    ["waiting_courier"],
    qc_rejected:  ["in_progress"],
  },
  QC_INSPECTOR: {
    qc_review: ["qc_passed", "qc_rejected"],
  },
  LOGISTICS: {
    waiting_courier: ["in_transit"],
    in_transit:      ["completed"],
  },
  DEALER_ADMIN: {
    analysis:  ["in_progress", "cancelled"],
    in_progress: ["cancelled"],
    qc_review: ["cancelled"],
    qc_passed: ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit: ["completed", "returned", "cancelled"],
    accepted:  ["completed"],
    completed: ["returned"],
  },
  DEALER_MANAGER: {
    analysis:  ["in_progress", "cancelled"],
    in_progress: ["cancelled"],
    qc_review: ["cancelled"],
    qc_passed: ["cancelled"],
    qc_rejected: ["cancelled"],
    waiting_courier: ["cancelled"],
    in_transit: ["completed", "returned", "cancelled"],
    accepted:  ["completed"],
    completed: ["returned"],
  },
};

// Combined: always add SUPER_ADMIN reject from any status
export function getAllowedTransitions(
  role: UserRole | null | undefined,
  currentStatus: OrderStatus,
): OrderStatus[] {
  if (!role) return [];
  const roleTransitions = STATUS_TRANSITIONS[role]?.[currentStatus] ?? [];
  // SUPER_ADMIN can reject from any non-terminal status
  if (role === "SUPER_ADMIN" && !["completed", "rejected", "returned", "cancelled"].includes(currentStatus)) {
    const set = new Set([...roleTransitions, "rejected" as OrderStatus]);
    return Array.from(set);
  }
  return [...roleTransitions];
}

// ── Next status button labels ────────────────────────────────────────────────

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

// ── Default redirect per role ────────────────────────────────────────────────

export function getDefaultRoute(role: UserRole | null | undefined): string {
  switch (role) {
    case "QC_INSPECTOR":
      return "/qc";
    case "LOGISTICS":
      return "/logistics";
    case "MASTER":
      return "/master/deliveries";
    case "BUYER":
    case "USER":
      return "/buyer/home";
    default:
      return "/orders";
  }
}
