import i18n from "@/i18n";

interface AxiosLikeError {
  response?: {
    status?: number;
    data?: { detail?: string | { code?: string; message?: string } | unknown };
  };
  message?: string;
}

const KEY_MAP: Record<string, string> = {
  "orders.matching_must_select_master": "ordersErrors.matching_must_select_master",
  "orders.not_fully_paid": "ordersErrors.not_fully_paid",
  "logistics.not_waiting_courier": "ordersErrors.not_waiting_courier",
  "logistics.not_in_matching": "ordersErrors.not_in_matching",
  "logistics.matching_needs_master": "ordersErrors.matching_needs_master",
  "logistics.not_a_master": "ordersErrors.not_a_master",
  "logistics.cannot_self_assign": "ordersErrors.cannot_self_assign",
  "logistics.master_inactive": "ordersErrors.master_inactive",
  "logistics.master_already_assigned": "ordersErrors.master_already_assigned",
  "orders.not_assigned_master": "ordersErrors.not_assigned_master",
  "service.invalid_transition": "ordersErrors.service_invalid_transition",
  "users.not_found": "ordersErrors.users_not_found",
};

function extractCode(detail: unknown): string | null {
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const d = detail as { code?: string; key?: string; message?: string };
    return d.code ?? d.key ?? null;
  }
  return null;
}

export function getApiErrorMessage(err: unknown): string {
  const e = err as AxiosLikeError;
  const detail = e?.response?.data?.detail;
  const code = extractCode(detail);

  if (code && KEY_MAP[code]) {
    return i18n.t(KEY_MAP[code]);
  }

  if (typeof detail === "string" && detail) {
    return detail;
  }

  if (detail && typeof detail === "object") {
    const msg = (detail as { message?: string }).message;
    if (msg) return msg;
  }

  return e?.message ?? i18n.t("ordersErrors.fallback");
}
