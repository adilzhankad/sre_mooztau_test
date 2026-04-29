import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useBuyerOrders, useBuyerServiceRequests } from "@/hooks/useBuyer";
import { formatMoney } from "@/lib/order-helpers";
import {
  formatBuyerDate,
  getBuyerFocusScore,
  getBuyerJourneyStep,
  getBuyerNextAction,
  getBuyerOrderImage,
  getBuyerOrderTitle,
  getBuyerPortalTheme,
  getBuyerStatusTone,
} from "@/lib/buyer-portal";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import type { BuyerOrder } from "@/types";

const ACTIVE_STATUSES = new Set([
  "analysis",
  "in_progress",
  "qc_review",
  "qc_passed",
  "qc_rejected",
  "waiting_courier",
  "in_transit",
]);

export function BuyerHomePage() {
  const navigate = useNavigate();
  const { data: orders } = useBuyerOrders();
  const { data: serviceRequests } = useBuyerServiceRequests();
  const fullName = useAuthStore((s) => s.fullName);
  const isDark = useThemeStore((s) => s.mode === "dark");
  const theme = getBuyerPortalTheme(isDark);

  const list = orders ?? [];
  const activeOrders = list.filter((order) => ACTIVE_STATUSES.has(order.status));
  const archivedOrders = list.length - activeOrders.length;
  const dueOrders = list.filter((order) => order.payment_remaining > 0);
  const openServiceRequests = (serviceRequests ?? []).filter(
    (item) => item.status !== "completed" && item.status !== "cancelled",
  );
  const inTransit = list.filter((order) => order.status === "in_transit").length;
  const warrantySoon = list.filter((order) => {
    if (!order.warranty_end_date) return false;
    const deadline = new Date(order.warranty_end_date).getTime();
    if (Number.isNaN(deadline)) return false;
    const daysLeft = Math.round((deadline - Date.now()) / 86_400_000);
    return daysLeft >= 0 && daysLeft <= 30;
  }).length;
  const totalDue = dueOrders.reduce((sum, order) => sum + Number(order.payment_remaining || 0), 0);
  const totalPaid = list.reduce((sum, order) => sum + Number(order.payment_received || 0), 0);
  const focusOrder = [...activeOrders].sort((a, b) => getBuyerFocusScore(b) - getBuyerFocusScore(a))[0]
    ?? [...list].sort((a, b) => getBuyerFocusScore(b) - getBuyerFocusScore(a))[0];
  const latestOrders = [...list]
    .sort((a, b) => (b.updated_at ?? b.order_date ?? "").localeCompare(a.updated_at ?? a.order_date ?? ""))
    .slice(0, 3);

  const firstName = fullName?.split(" ").find(Boolean) ?? "покупатель";
  const greeting = getGreeting();
  const paymentTarget = dueOrders[0] ? `/buyer/orders/${dueOrders[0].id}` : "/buyer/orders";
  const managerAction = focusOrder?.manager_phone
    ? () => {
        window.location.href = `tel:${focusOrder.manager_phone}`;
      }
    : () => navigate("/buyer/messages");

  const attentionItems = [
    dueOrders[0]
      ? {
          title: "Нужна оплата",
          text: `${dueOrders[0].order_number} · ${formatMoney(dueOrders[0].payment_remaining)}`,
          action: "Открыть заказ",
          onClick: () => navigate(`/buyer/orders/${dueOrders[0].id}`),
          tone: "danger" as const,
        }
      : null,
    focusOrder?.deadline
      ? {
          title: "Ближайший срок",
          text: `${focusOrder.order_number} · ${formatBuyerDate(focusOrder.deadline)}`,
          action: "Посмотреть детали",
          onClick: () => navigate(`/buyer/orders/${focusOrder.id}`),
          tone: "warning" as const,
        }
      : null,
    openServiceRequests[0]
      ? {
          title: "Сервис на контроле",
          text: `${openServiceRequests[0].ticket_number} · ${openServiceRequests[0].status_label ?? "В работе"}`,
          action: "К заявкам",
          onClick: () => navigate("/buyer/service"),
          tone: "info" as const,
        }
      : null,
  ].filter(Boolean) as {
    title: string;
    text: string;
    action: string;
    onClick: () => void;
    tone: "danger" | "warning" | "info";
  }[];

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "calc(var(--safe-top, 0px) + 18px) 16px 28px",
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
              top: -92,
              right: -42,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: theme.heroGlow,
            }}
          />

          <div style={{ position: "relative", display: "grid", gap: 18 }}>
            <div>
              <p style={heroEyebrowStyle(theme)}>Личный кабинет</p>
              <h1 style={{ margin: "6px 0 0", fontSize: 30, lineHeight: 1.02, fontWeight: 900, letterSpacing: -1 }}>
                {greeting}, {firstName}
              </h1>
              <p style={{ margin: "10px 0 0", maxWidth: 520, fontSize: 14, lineHeight: 1.65, color: theme.heroMuted }}>
                Все ключевые действия по заказам, оплате, сервису и доставке собраны в одном месте.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
              }}
            >
              <HeroMetric
                label="К оплате"
                value={formatMoney(totalDue)}
                note={dueOrders.length > 0 ? `${dueOrders.length} заказ(а)` : "Нет долгов"}
              />
              <HeroMetric
                label="В работе"
                value={String(activeOrders.length)}
                note={inTransit > 0 ? `${inTransit} уже едет` : "Без задержек"}
              />
              <HeroMetric
                label="Сервис"
                value={String(openServiceRequests.length)}
                note={openServiceRequests.length > 0 ? "Открытые заявки" : "Заявок нет"}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <HeroAction
                label="Мои заказы"
                secondary={false}
                onClick={() => navigate("/buyer/orders")}
              />
              <HeroAction
                label="Сервис и гарантия"
                secondary
                onClick={() => navigate("/buyer/service")}
              />
              <HeroAction
                label={focusOrder?.manager_phone ? "Позвонить менеджеру" : "Открыть сообщения"}
                secondary
                onClick={managerAction}
              />
            </div>

            {focusOrder && (
              <button
                type="button"
                onClick={() => navigate(`/buyer/orders/${focusOrder.id}`)}
                style={{
                  width: "100%",
                  display: "grid",
                  gap: 12,
                  textAlign: "left",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 24,
                  padding: 16,
                  cursor: "pointer",
                  color: theme.heroText,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={heroEyebrowStyle(theme)}>Сейчас на контроле</p>
                    <p style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>
                      {focusOrder.order_number}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: theme.heroMuted }}>
                      {getBuyerOrderTitle(focusOrder)}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(255, 255, 255, 0.1)",
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <IconCompass />
                    Маршрут заказа
                  </span>
                </div>

                <JourneyProgress
                  currentStep={getBuyerJourneyStep(focusOrder)}
                  labels={["Принят", "В работе", "Готов", "В пути", "У вас"]}
                  textColor={theme.heroText}
                  mutedColor={theme.heroMuted}
                  accent={theme.accent}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: theme.heroMuted }}>
                    {getBuyerNextAction(focusOrder)}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: theme.accentDeep }}>
                    Открыть →
                  </span>
                </div>
              </button>
            )}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          <MetricCard
            title="Активные заказы"
            value={String(activeOrders.length)}
            note={archivedOrders > 0 ? `${archivedOrders} в истории` : "Новые статусы придут сюда"}
            icon={<IconStack />}
            theme={theme}
          />
          <MetricCard
            title="В пути"
            value={String(inTransit)}
            note={inTransit > 0 ? "Следите за доставкой" : "Сейчас без доставок"}
            icon={<IconTruck />}
            theme={theme}
          />
          <MetricCard
            title="Гарантия"
            value={String(warrantySoon)}
            note={warrantySoon > 0 ? "Истекает в ближайший месяц" : "Всё под контролем"}
            icon={<IconShield />}
            theme={theme}
          />
          <MetricCard
            title="Оплачено"
            value={formatMoney(totalPaid)}
            note={dueOrders.length > 0 ? `Остаток ${formatMoney(totalDue)}` : "Все оплаты подтверждены"}
            icon={<IconWallet />}
            theme={theme}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <QuickActionCard
            title="Заказы"
            note="Открыть список, статусы и документы"
            icon={<IconOrders />}
            onClick={() => navigate("/buyer/orders")}
            theme={theme}
          />
          <QuickActionCard
            title="Оплата"
            note="Найти заказ с остатком и загрузить платеж"
            icon={<IconWallet />}
            onClick={() => navigate(paymentTarget)}
            theme={theme}
          />
          <QuickActionCard
            title="Сервис"
            note="Гарантия, выезд мастера и история заявок"
            icon={<IconToolbox />}
            onClick={() => navigate("/buyer/service")}
            theme={theme}
          />
          <QuickActionCard
            title={focusOrder?.manager_phone ? "Менеджер" : "Сообщения"}
            note={focusOrder?.manager_phone ? "Позвонить по заказу в один тап" : "Проверить уведомления"}
            icon={focusOrder?.manager_phone ? <IconPhone /> : <IconBell />}
            onClick={managerAction}
            theme={theme}
          />
        </section>

        {attentionItems.length > 0 && (
          <section
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <SectionHeading
              title="Что лучше сделать сейчас"
              subtitle="Самые полезные шаги без поиска по интерфейсу"
              theme={theme}
            />

            <div style={{ display: "grid", gap: 10 }}>
              {attentionItems.map((item) => (
                <AttentionCard key={item.title} {...item} theme={theme} />
              ))}
            </div>
          </section>
        )}

        <section style={{ display: "grid", gap: 12 }}>
          <SectionHeading
            title="Последние заказы"
            subtitle="Откройте любой заказ и продолжите с того места, где остановились"
            theme={theme}
            actionLabel={list.length > 3 ? "Смотреть все" : undefined}
            onAction={list.length > 3 ? () => navigate("/buyer/orders") : undefined}
          />

          {latestOrders.length > 0 ? (
            <div style={{ display: "grid", gap: 10 }}>
              {latestOrders.map((order) => (
                <RecentOrderCard
                  key={order.id}
                  order={order}
                  onClick={() => navigate(`/buyer/orders/${order.id}`)}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <EmptySurface
              title="Заказов пока нет"
              text="Как только менеджер оформит первый заказ, он появится здесь вместе со статусом, оплатой и сервисом."
              theme={theme}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Спокойной ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function SectionHeading({
  title,
  subtitle,
  theme,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  theme: ReturnType<typeof getBuyerPortalTheme>;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 21,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: -0.7,
            color: theme.text,
            fontFamily: "var(--buyer-font-display)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: "5px 0 0", fontSize: 13, color: theme.muted, lineHeight: 1.55 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            border: "none",
            background: "transparent",
            color: theme.accentDeep,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
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

function HeroAction({
  label,
  secondary,
  onClick,
}: {
  label: string;
  secondary: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 46,
        padding: "12px 16px",
        borderRadius: 999,
        border: secondary ? "1px solid rgba(255, 255, 255, 0.14)" : "none",
        background: secondary ? "rgba(255, 255, 255, 0.08)" : "#A6CA39",
        color: secondary ? "#FFFFFF" : "#111827",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  note,
  icon,
  theme,
}: {
  title: string;
  value: string;
  note: string;
  icon: ReactNode;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 24,
        padding: 16,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: theme.accentSoft,
          color: theme.accentDeep,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7, color: theme.muted }}>
        {title}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 900, letterSpacing: -0.7, color: theme.text }}>
        {value}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, color: theme.muted }}>
        {note}
      </p>
    </div>
  );
}

function QuickActionCard({
  title,
  note,
  icon,
  onClick,
  theme,
}: {
  title: string;
  note: string;
  icon: ReactNode;
  onClick: () => void;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 24,
        padding: 16,
        textAlign: "left",
        cursor: "pointer",
        display: "grid",
        gap: 12,
        color: theme.text,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: theme.surfaceMuted,
          color: theme.text,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</p>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.55, color: theme.muted }}>
          {note}
        </p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: theme.accentDeep }}>
        Перейти →
      </span>
    </button>
  );
}

function AttentionCard({
  title,
  text,
  action,
  onClick,
  tone,
  theme,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
  tone: "danger" | "warning" | "info";
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  const palette = {
    danger: { fg: theme.danger, bg: theme.dangerSoft, icon: <IconWallet /> },
    warning: { fg: theme.warning, bg: theme.warningSoft, icon: <IconClock /> },
    info: { fg: theme.info, bg: theme.infoSoft, icon: <IconCompass /> },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 24,
        padding: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        textAlign: "left",
        cursor: "pointer",
        color: theme.text,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 16,
          background: palette.bg,
          color: palette.fg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {palette.icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{title}</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.55, color: theme.muted }}>{text}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: palette.fg, flexShrink: 0 }}>
        {action}
      </span>
    </button>
  );
}

function RecentOrderCard({
  order,
  onClick,
  theme,
}: {
  order: BuyerOrder;
  onClick: () => void;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  const buyerLabel = order.status_display ?? order.status_label;
  const tone = getBuyerStatusTone(buyerLabel);
  const image = getBuyerOrderImage(order);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 26,
        padding: 14,
        display: "flex",
        gap: 14,
        alignItems: "center",
        textAlign: "left",
        cursor: "pointer",
        color: theme.text,
      }}
    >
      <div
        style={{
          width: 82,
          height: 82,
          borderRadius: 20,
          overflow: "hidden",
          background: theme.surfaceMuted,
          flexShrink: 0,
        }}
      >
        <img src={image} alt={getBuyerOrderTitle(order)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div style={{ minWidth: 0, flex: 1, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: theme.muted, letterSpacing: 0.5 }}>
              {order.order_number}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {getBuyerOrderTitle(order)}
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background: tone.bg,
              color: tone.fg,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {buyerLabel}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: theme.muted }}>
          {getBuyerNextAction(order)}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <OrderMetaBadge label={`Обновлён ${formatBuyerDate(order.updated_at ?? order.order_date)}`} theme={theme} />
          <OrderMetaBadge label={formatMoney(order.final_amount)} theme={theme} />
          {order.payment_remaining > 0 && (
            <OrderMetaBadge label={`К оплате ${formatMoney(order.payment_remaining)}`} theme={theme} tone="danger" />
          )}
        </div>
      </div>
    </button>
  );
}

function OrderMetaBadge({
  label,
  theme,
  tone,
}: {
  label: string;
  theme: ReturnType<typeof getBuyerPortalTheme>;
  tone?: "danger";
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 30,
        padding: "0 10px",
        borderRadius: 999,
        background: tone === "danger" ? theme.dangerSoft : theme.surfaceMuted,
        color: tone === "danger" ? theme.danger : theme.muted,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function JourneyProgress({
  currentStep,
  labels,
  textColor,
  mutedColor,
  accent,
}: {
  currentStep: number;
  labels: string[];
  textColor: string;
  mutedColor: string;
  accent: string;
}) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${labels.length}, 1fr)`, gap: 8 }}>
        {labels.map((label, index) => {
          const active = index <= currentStep;
          return (
            <div key={label} style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: active ? accent : "rgba(255, 255, 255, 0.12)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  lineHeight: 1.35,
                  color: active ? textColor : mutedColor,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptySurface({
  title,
  text,
  theme,
}: {
  title: string;
  text: string;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: theme.border,
        boxShadow: theme.shadow,
        borderRadius: 28,
        padding: "38px 22px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          margin: "0 auto 16px",
          borderRadius: 22,
          background: theme.accentSoft,
          color: theme.accentDeep,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconStack />
      </div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: theme.text }}>{title}</p>
      <p style={{ margin: "8px auto 0", maxWidth: 380, fontSize: 14, lineHeight: 1.6, color: theme.muted }}>{text}</p>
    </div>
  );
}

const heroEyebrowStyle = (theme: ReturnType<typeof getBuyerPortalTheme>): CSSProperties => ({
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  color: theme.heroMuted,
});

const heroMetricLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: "rgba(255, 255, 255, 0.72)",
};

function IconCompass() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9} />
      <path d="M15.5 8.5l-2.3 5.7-5.7 2.3 2.3-5.7 5.7-2.3z" />
    </svg>
  );
}

function IconStack() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 4.5L12 12 3 7.5 12 3z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5 12 21l9-4.5" />
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

function IconShield() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v7c0 5-3.5 9-8 10-4.5-1-8-5-8-10V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
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

function IconOrders() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
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

function IconPhone() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
