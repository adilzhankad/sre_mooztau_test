import { useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useBuyerOrders, useBuyerServiceRequests } from "@/hooks/useBuyer";
import { formatMoney } from "@/lib/order-helpers";
import { formatBuyerDate, formatBuyerDateTime, getBuyerPortalTheme } from "@/lib/buyer-portal";
import { useThemeStore } from "@/stores/theme-store";
import type { BuyerOrder } from "@/types";

type Message = {
  id: string;
  orderId?: number | null;
  title: string;
  body: string;
  date: string;
  kind: "status" | "payment" | "warranty" | "service";
};

export function BuyerMessagesPage() {
  const navigate = useNavigate();
  const { data: orders } = useBuyerOrders();
  const { data: serviceRequests } = useBuyerServiceRequests();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const theme = getBuyerPortalTheme(isDark);

  const messages = useMemo(
    () => deriveMessages(orders ?? [], serviceRequests ?? []),
    [orders, serviceRequests],
  );

  const stats = {
    all: messages.length,
    payment: messages.filter((item) => item.kind === "payment").length,
    service: messages.filter((item) => item.kind === "service").length,
    warranty: messages.filter((item) => item.kind === "warranty").length,
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "calc(var(--safe-top, 0px) + 18px) 16px 30px",
        background: theme.pageBg,
        fontFamily: "var(--buyer-font-body)",
      }}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 30,
            background: theme.heroBg,
            border: theme.border,
            boxShadow: theme.shadow,
            color: theme.heroText,
            padding: "22px 20px 20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -52,
              top: -92,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: theme.heroGlow,
            }}
          />

          <div style={{ position: "relative", display: "grid", gap: 16 }}>
            <div>
              <p style={heroEyebrowStyle(theme)}>Лента уведомлений</p>
              <h1 style={{ margin: "6px 0 0", fontSize: 30, lineHeight: 1.03, fontWeight: 900, letterSpacing: -1 }}>
                Сообщения и статусы
              </h1>
              <p style={{ margin: "10px 0 0", maxWidth: 520, fontSize: 14, lineHeight: 1.65, color: theme.heroMuted }}>
                Здесь собираются важные обновления по заказам, оплате, гарантии и сервису.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <HeroMetric label="Всего" value={String(stats.all)} note="Все уведомления" />
              <HeroMetric label="Оплата" value={String(stats.payment)} note="Что требует внимания" />
              <HeroMetric label="Сервис" value={String(stats.service)} note="Заявки и мастера" />
              <HeroMetric label="Гарантия" value={String(stats.warranty)} note="Сроки и напоминания" />
            </div>
          </div>
        </section>

        {messages.length > 0 ? (
          <section
            style={{
              background: theme.surface,
              border: theme.border,
              boxShadow: theme.shadow,
              borderRadius: 28,
              overflow: "hidden",
            }}
          >
            {messages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
                theme={theme}
                onClick={() => {
                  if (message.kind === "service") {
                    navigate("/buyer/service");
                    return;
                  }

                  if (message.orderId) {
                    navigate(`/buyer/orders/${message.orderId}`);
                  }
                }}
              />
            ))}
          </section>
        ) : (
          <EmptyState theme={theme} />
        )}
      </div>
    </div>
  );
}

function deriveMessages(
  orders: BuyerOrder[],
  serviceRequests: Array<{
    id: number;
    ticket_number: string;
    product_name: string;
    status: string;
    status_label?: string | null;
    updated_at?: string;
    created_at?: string;
  }>,
): Message[] {
  const list: Message[] = [];
  const now = Date.now();
  const day = 86_400_000;

  for (const order of orders) {
    if (order.status === "waiting_courier") {
      list.push({
        id: `${order.id}-ready`,
        orderId: order.id,
        title: "Заказ готов к отправке",
        body: `${order.order_number} передан в отгрузку`,
        date: order.updated_at ?? order.order_date,
        kind: "status",
      });
    }

    if (order.status === "in_transit") {
      list.push({
        id: `${order.id}-transit`,
        orderId: order.id,
        title: "Заказ уже в пути",
        body: `${order.order_number} едет по адресу ${order.delivery_address ?? ""}`,
        date: order.dispatch_date ?? order.updated_at ?? order.order_date,
        kind: "status",
      });
    }

    if (order.payment_remaining > 0) {
      list.push({
        id: `${order.id}-payment`,
        orderId: order.id,
        title: "Остаток к оплате",
        body: `${order.order_number} · ${formatMoney(order.payment_remaining)}`,
        date: order.updated_at ?? order.order_date,
        kind: "payment",
      });
    }

    if (order.warranty_end_date) {
      const end = new Date(order.warranty_end_date).getTime();
      if (!Number.isNaN(end)) {
        const daysLeft = Math.round((end - now) / day);
        if (daysLeft >= 0 && daysLeft <= 30) {
          list.push({
            id: `${order.id}-warranty`,
            orderId: order.id,
            title: "Гарантия скоро заканчивается",
            body: `${order.order_number} · осталось ${daysLeft} дн.`,
            date: order.warranty_end_date,
            kind: "warranty",
          });
        }
      }
    }
  }

  for (const request of serviceRequests) {
    if (request.status !== "completed" && request.status !== "cancelled") {
      list.push({
        id: `service-${request.id}`,
        title: "Сервисная заявка обновлена",
        body: `${request.ticket_number} · ${request.product_name} · ${request.status_label ?? request.status}`,
        date: request.updated_at ?? request.created_at ?? "",
        kind: "service",
      });
    }
  }

  return list.sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""));
}

function MessageRow({
  message,
  onClick,
  isLast,
  theme,
}: {
  message: Message;
  onClick: () => void;
  isLast: boolean;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  const tone = MESSAGE_TONE[message.kind](theme);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "16px 18px",
        background: "transparent",
        border: "none",
        borderBottom: isLast ? "none" : theme.border,
        cursor: "pointer",
        textAlign: "left",
        color: theme.text,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 16,
          background: tone.bg,
          color: tone.fg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {tone.icon}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{message.title}</p>
            <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.55, color: theme.muted }}>{message.body}</p>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "6px 10px",
              borderRadius: 999,
              background: tone.bg,
              color: tone.fg,
              whiteSpace: "nowrap",
            }}
          >
            {tone.label}
          </span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: theme.muted }}>
          {formatBuyerDateTime(message.date) || formatBuyerDate(message.date)}
        </p>
      </div>
    </button>
  );
}

function EmptyState({ theme }: { theme: ReturnType<typeof getBuyerPortalTheme> }) {
  return (
    <div
      style={{
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 28,
        padding: "42px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 24,
          margin: "0 auto 16px",
          background: theme.accentSoft,
          color: theme.accentDeep,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconBell />
      </div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: theme.text }}>Пока без новых сообщений</p>
      <p style={{ margin: "8px auto 0", maxWidth: 360, fontSize: 14, lineHeight: 1.6, color: theme.muted }}>
        Как только изменится статус заказа, появится остаток к оплате или обновится сервисная заявка, всё появится здесь.
      </p>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 14,
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <p style={heroMetricLabelStyle}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 900, letterSpacing: -0.7 }}>{value}</p>
      <p style={{ margin: "3px 0 0", fontSize: 12, lineHeight: 1.45, color: "rgba(255, 255, 255, 0.72)" }}>{note}</p>
    </div>
  );
}

const MESSAGE_TONE: Record<
  Message["kind"],
  (theme: ReturnType<typeof getBuyerPortalTheme>) => {
    fg: string;
    bg: string;
    label: string;
    icon: ReactNode;
  }
> = {
  status: (theme) => ({ fg: theme.info, bg: theme.infoSoft, label: "Статус", icon: <IconTruck /> }),
  payment: (theme) => ({ fg: theme.danger, bg: theme.dangerSoft, label: "Оплата", icon: <IconWallet /> }),
  warranty: (theme) => ({ fg: theme.warning, bg: theme.warningSoft, label: "Гарантия", icon: <IconShield /> }),
  service: (theme) => ({ fg: theme.success, bg: theme.successSoft, label: "Сервис", icon: <IconToolbox /> }),
};

const heroEyebrowStyle = (theme: ReturnType<typeof getBuyerPortalTheme>) => ({
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.1,
  textTransform: "uppercase" as const,
  color: theme.heroMuted,
});

const heroMetricLabelStyle = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  color: "rgba(255, 255, 255, 0.72)",
};

function IconBell() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={1.5} y={6} width={13} height={10} rx={1.5} />
      <path d="M14.5 10h4l3 3v3h-7z" />
      <circle cx={6} cy={18} r={2} />
      <circle cx={17.5} cy={18} r={2} />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={7} width={18} height={12} rx={2} />
      <path d="M3 11h18" />
      <path d="M17 15h.01" strokeWidth={2.4} />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v7c0 5-3.5 9-8 10-4.5-1-8-5-8-10V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconToolbox() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={7} width={18} height={11} rx={2} />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}
