import { formatDateTime } from "@/lib/order-helpers";
import type { AuditLog } from "@/types";
import { ACTION_COLORS, ACTION_LABELS, RESOURCE_LABELS } from "./constants";

export function getActionLabel(action: string) {
  return ACTION_LABELS[action] ?? action;
}

export function getResourceLabel(resourceType: string) {
  return RESOURCE_LABELS[resourceType] ?? resourceType;
}

export function getActionColor(action: string) {
  return ACTION_COLORS[action] ?? "#6b7280";
}

export function formatAuditDate(value: string) {
  return formatDateTime(value);
}

export function getSuspiciousCount(
  suspicious?: {
    mass_deletions?: unknown[];
    night_logins?: unknown[];
  } | unknown,
) {
  if (!suspicious || typeof suspicious !== "object" || Array.isArray(suspicious)) return 0;
  const s = suspicious as { mass_deletions?: unknown[]; night_logins?: unknown[] };
  return (s.mass_deletions?.length ?? 0) + (s.night_logins?.length ?? 0);
}

export function getLogTitle(log: AuditLog) {
  return `${getResourceLabel(log.resource_type)}${log.resource_id ? ` #${log.resource_id}` : ""}`;
}
