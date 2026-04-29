import { formatMoney } from "@/lib/order-helpers";
import { getProductImageUrl } from "@/lib/product-images";
import type { BuyerOrder } from "@/types";

export type BuyerPortalTheme = {
  pageBg: string;
  surface: string;
  surfaceAlt: string;
  surfaceMuted: string;
  border: string;
  shadow: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  accentContrast: string;
  heroBg: string;
  heroGlow: string;
  heroText: string;
  heroMuted: string;
  dockBg: string;
  dockBorder: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;
};

export function getBuyerPortalTheme(isDark: boolean): BuyerPortalTheme {
  if (isDark) {
    return {
      pageBg: "linear-gradient(180deg, #0c1117 0%, #121a22 46%, #181d22 100%)",
      surface: "rgba(18, 25, 33, 0.92)",
      surfaceAlt: "rgba(22, 31, 40, 0.96)",
      surfaceMuted: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      shadow: "0 24px 48px rgba(0, 0, 0, 0.28)",
      text: "#F2F4F7",
      muted: "#98A2B3",
      accent: "#B6D44E",
      accentSoft: "rgba(182, 212, 78, 0.16)",
      accentDeep: "#D8E88C",
      accentContrast: "#111827",
      heroBg: "linear-gradient(135deg, #0e141b 0%, #16212c 58%, #303d1f 100%)",
      heroGlow: "radial-gradient(circle, rgba(182, 212, 78, 0.32) 0%, rgba(182, 212, 78, 0) 72%)",
      heroText: "#FCFCFD",
      heroMuted: "rgba(252, 252, 253, 0.74)",
      dockBg: "rgba(11, 17, 22, 0.88)",
      dockBorder: "1px solid rgba(255, 255, 255, 0.08)",
      danger: "#FF9C80",
      dangerSoft: "rgba(255, 156, 128, 0.16)",
      warning: "#F7CA74",
      warningSoft: "rgba(247, 202, 116, 0.16)",
      success: "#89D6A4",
      successSoft: "rgba(137, 214, 164, 0.16)",
      info: "#78B8E4",
      infoSoft: "rgba(120, 184, 228, 0.16)",
    };
  }

  return {
    pageBg: "linear-gradient(180deg, #F6F2E8 0%, #F1ECE1 34%, #ECE8E0 100%)",
    surface: "rgba(255, 255, 255, 0.9)",
    surfaceAlt: "rgba(252, 248, 241, 0.94)",
    surfaceMuted: "#F2ECDF",
    border: "1px solid rgba(26, 34, 45, 0.08)",
    shadow: "0 22px 44px rgba(24, 33, 44, 0.08)",
    text: "#17212B",
    muted: "#667085",
    accent: "#A6CA39",
    accentSoft: "#EEF6D5",
    accentDeep: "#748B1A",
    accentContrast: "#111827",
    heroBg: "linear-gradient(135deg, #141B24 0%, #202B39 58%, #4A5A20 100%)",
    heroGlow: "radial-gradient(circle, rgba(166, 202, 57, 0.34) 0%, rgba(166, 202, 57, 0) 74%)",
    heroText: "#FFFFFF",
    heroMuted: "rgba(255, 255, 255, 0.74)",
    dockBg: "rgba(17, 24, 39, 0.9)",
    dockBorder: "1px solid rgba(255, 255, 255, 0.14)",
    danger: "#B54708",
    dangerSoft: "#FBE7D2",
    warning: "#A15C07",
    warningSoft: "#F8E7C7",
    success: "#027A48",
    successSoft: "#DDF3E7",
    info: "#155B75",
    infoSoft: "#DDECF2",
  };
}

const STATUS_TONE: Record<string, { fg: string; bg: string }> = {
  "Принят": { fg: "#505A68", bg: "#EFF2F5" },
  "В работе": { fg: "#155B75", bg: "#DDECF2" },
  "Готов к отправке": { fg: "#6C4E11", bg: "#F7E8C2" },
  "В пути": { fg: "#0A6C8E", bg: "#DDF0F8" },
  "Доставлен": { fg: "#027A48", bg: "#DDF3E7" },
  "Принят клиентом": { fg: "#027A48", bg: "#DDF3E7" },
  "Завершён": { fg: "#027A48", bg: "#DDF3E7" },
  "Возврат": { fg: "#B54708", bg: "#FBE7D2" },
  "Отменён": { fg: "#667085", bg: "#EEF0F3" },
  "Отклонён": { fg: "#B42318", bg: "#FEE4E2" },
};

export function getBuyerStatusTone(label: string) {
  return STATUS_TONE[label] ?? { fg: "#505A68", bg: "#EFF2F5" };
}

export function formatBuyerDate(date?: string | null, locale = "ru-KZ") {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatBuyerDateTime(date?: string | null, locale = "ru-KZ") {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  return value.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getBuyerOrderImage(order: Pick<BuyerOrder, "items">) {
  const firstItem = order.items[0];
  if (!firstItem) return "/products/fallback.svg";

  const fi = firstItem as {
    product_id?: number | null;
    id?: number | null;
    name?: string | null;
    image_url?: string | null;
  };
  return getProductImageUrl({
    id: fi.product_id ?? fi.id ?? null,
    model: firstItem.model,
    name: fi.name ?? null,
    category: firstItem.category,
    image_url: fi.image_url ?? null,
  }) ?? "/products/fallback.svg";
}

export function getBuyerOrderTitle(order: Pick<BuyerOrder, "items">) {
  const firstItem = order.items[0];
  if (!firstItem) return "Без позиции";
  const extra = order.items.length > 1 ? ` +${order.items.length - 1}` : "";
  return `${firstItem.model}${extra}`;
}

export function getBuyerJourneyStep(order: Pick<BuyerOrder, "status">) {
  if (["analysis"].includes(order.status)) return 0;
  if (["in_progress", "qc_review", "qc_passed", "qc_rejected"].includes(order.status)) return 1;
  if (["waiting_courier"].includes(order.status)) return 2;
  if (["in_transit"].includes(order.status)) return 3;
  return 4;
}

export function getBuyerNextAction(order: BuyerOrder) {
  if (order.payment_remaining > 0) {
    return `Осталось оплатить ${formatMoney(order.payment_remaining)}`;
  }

  switch (order.status) {
    case "analysis":
      return "Менеджер подтвердил заказ и готовит запуск";
    case "in_progress":
    case "qc_review":
    case "qc_passed":
    case "qc_rejected":
      return "Изделия в работе. Следующее обновление придёт сюда";
    case "waiting_courier":
      return "Заказ собран и ожидает передачу курьеру";
    case "in_transit":
      return "Доставка уже в пути";
    case "accepted":
      return "Заказ принят вами и закрыт";
    case "completed":
      return "Проект завершён. Гарантия и сервис остаются доступны";
    case "returned":
      return "Оформлен возврат";
    case "cancelled":
      return "Заказ отменён";
    case "rejected":
      return "Заказ отклонён";
    default:
      return order.status_display ?? order.status_label;
  }
}

export function getBuyerFocusScore(order: BuyerOrder) {
  let score = 0;
  if (order.payment_remaining > 0) score += 1000 + Number(order.payment_remaining);
  switch (order.status) {
    case "in_transit":
      score += 700;
      break;
    case "waiting_courier":
      score += 600;
      break;
    case "in_progress":
    case "qc_review":
    case "qc_passed":
    case "qc_rejected":
      score += 500;
      break;
    case "analysis":
      score += 400;
      break;
    default:
      break;
  }

  if (order.deadline) {
    const deadline = new Date(order.deadline).getTime();
    if (!Number.isNaN(deadline)) {
      const daysLeft = Math.round((deadline - Date.now()) / 86_400_000);
      if (daysLeft <= 0) score += 250;
      else if (daysLeft <= 3) score += 200;
      else if (daysLeft <= 7) score += 120;
    }
  }

  const updated = new Date(order.updated_at ?? order.order_date ?? 0).getTime();
  if (!Number.isNaN(updated)) {
    score += Math.round(updated / 1_000_000);
  }

  return score;
}

export function getBuyerAttentionBadge(order: BuyerOrder) {
  if (order.payment_remaining > 0) {
    return {
      label: `К оплате ${formatMoney(order.payment_remaining)}`,
      tone: "danger" as const,
    };
  }

  if (order.status === "in_transit") {
    return {
      label: "Едет к вам",
      tone: "info" as const,
    };
  }

  if (order.deadline) {
    const deadline = new Date(order.deadline).getTime();
    if (!Number.isNaN(deadline)) {
      const daysLeft = Math.round((deadline - Date.now()) / 86_400_000);
      if (daysLeft <= 0) {
        return {
          label: "Срок уже сегодня",
          tone: "warning" as const,
        };
      }
      if (daysLeft <= 3) {
        return {
          label: `Срок через ${daysLeft} дн.`,
          tone: "warning" as const,
        };
      }
    }
  }

  return {
    label: order.status_display ?? order.status_label,
    tone: "neutral" as const,
  };
}
