import { ROLE_LABELS } from "@/types";
import type { OrgType, UserRole } from "@/types";
import i18n from "@/i18n";

const LOCALE_MAP: Record<string, string> = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((chunk) => chunk[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getRoleLabel(role: UserRole | null | undefined): string {
  if (!role) return i18n.t("role.fallback");
  return ROLE_LABELS[role] ?? role;
}

export function getOrgTypeLabel(type: OrgType | null | undefined): string {
  if (!type) return i18n.t("orgType.fallback");
  return i18n.t(`orgType.${type}`);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return i18n.t("common.dash");

  const lang = (i18n.resolvedLanguage ?? i18n.language ?? "ru").slice(0, 2);
  const locale = LOCALE_MAP[lang] ?? "ru-RU";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPhone(phone: string | null | undefined): string {
  return phone?.trim() ? phone : i18n.t("common.dash");
}

export function formatOptional(value: string | null | undefined): string {
  return value?.trim() ? value : i18n.t("common.dash");
}
