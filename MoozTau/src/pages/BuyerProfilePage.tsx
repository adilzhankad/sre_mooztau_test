import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageCycleToggle } from "@/components/LanguageCycleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLogout } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useProfile";
import { getBuyerPortalTheme } from "@/lib/buyer-portal";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

export function BuyerProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useLogout();
  const { data: me } = useMe();
  const storeName = useAuthStore((s) => s.fullName);
  const isDark = useThemeStore((s) => s.mode === "dark");
  const theme = getBuyerPortalTheme(isDark);

  const fullName = me?.full_name ?? storeName ?? t("profile.fallbackName");
  const phone = me?.phone ?? "";
  const email = me?.email ?? "";
  const initials = (fullName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

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
              right: -54,
              top: -92,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: theme.heroGlow,
            }}
          />

          <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: 24,
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: -1,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={heroEyebrowStyle(theme)}>Профиль покупателя</p>
              <h1 style={{ margin: "6px 0 0", fontSize: 28, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1 }}>
                {fullName}
              </h1>
              {phone && (
                <p style={{ margin: "10px 0 0", fontSize: 14, color: theme.heroMuted }}>
                  {phone}
                </p>
              )}
              {email && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: theme.heroMuted, wordBreak: "break-word" }}>
                  {email}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <ShortcutCard
            title="Мои заказы"
            note="Статусы, оплата и документы"
            icon={<IconOrders />}
            onClick={() => navigate("/buyer/orders")}
            theme={theme}
          />
          <ShortcutCard
            title="Сервис"
            note="Гарантия и выезды мастера"
            icon={<IconToolbox />}
            onClick={() => navigate("/buyer/service")}
            theme={theme}
          />
          <ShortcutCard
            title="Сообщения"
            note="Все уведомления в одной ленте"
            icon={<IconBell />}
            onClick={() => navigate("/buyer/messages")}
            theme={theme}
          />
        </section>

        <section
          style={{
            background: theme.surface,
            border: theme.border,
            boxShadow: theme.shadow,
            borderRadius: 28,
            overflow: "hidden",
          }}
        >
          <SettingRow
            icon={<IconGlobe />}
            label={t("language.label")}
            hint="Переключение языка кабинета"
            trailing={<LanguageCycleToggle compact />}
            theme={theme}
          />
          <Divider theme={theme} />
          <SettingRow
            icon={<IconPalette />}
            label="Тема"
            hint="Светлая или тёмная схема"
            trailing={<ThemeToggle compact />}
            theme={theme}
          />
        </section>

        <section
          style={{
            background: theme.surface,
            border: theme.border,
            boxShadow: theme.shadow,
            borderRadius: 28,
            overflow: "hidden",
          }}
        >
          <SettingRow
            icon={<IconBell />}
            label="Уведомления"
            hint="Платежи, доставка и сервис"
            onClick={() => navigate("/buyer/messages")}
            theme={theme}
          />
          <Divider theme={theme} />
          <SettingRow
            icon={<IconToolbox />}
            label="Сервис и гарантия"
            hint="Открыть заявки и мастеров"
            onClick={() => navigate("/buyer/service")}
            theme={theme}
          />
          <Divider theme={theme} />
          <SettingRow
            icon={<IconInfo />}
            label="О кабинете"
            hint="MoozTau Buyer Portal"
            theme={theme}
          />
        </section>

        <button
          type="button"
          onClick={logout}
          style={{
            width: "100%",
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 18px",
            borderRadius: 22,
            border: "none",
            background: theme.surface,
            boxShadow: theme.shadow,
            color: "#B42318",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "#FEE4E2",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconLogout />
          </span>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Выйти из аккаунта</span>
        </button>
      </div>
    </div>
  );
}

function ShortcutCard({
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
          background: theme.accentSoft,
          color: theme.accentDeep,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</p>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.55, color: theme.muted }}>{note}</p>
      </div>
    </button>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  trailing,
  onClick,
  theme,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  theme: ReturnType<typeof getBuyerPortalTheme>;
}) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive && !trailing}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: interactive ? "pointer" : "default",
        textAlign: "left",
        color: theme.text,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: theme.surfaceMuted,
          color: theme.text,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{label}</p>
        {hint && (
          <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, color: theme.muted }}>
            {hint}
          </p>
        )}
      </span>
      {trailing ? (
        <span onClick={(event) => event.stopPropagation()} style={{ flexShrink: 0 }}>
          {trailing}
        </span>
      ) : interactive ? (
        <span style={{ color: theme.muted, flexShrink: 0 }}>
          <IconChevron />
        </span>
      ) : null}
    </button>
  );
}

function Divider({ theme }: { theme: ReturnType<typeof getBuyerPortalTheme> }) {
  return (
    <div
      style={{
        height: 1,
        marginLeft: 70,
        background: theme.border.replace("1px solid ", ""),
      }}
    />
  );
}

const heroEyebrowStyle = (theme: ReturnType<typeof getBuyerPortalTheme>) => ({
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.1,
  textTransform: "uppercase" as const,
  color: theme.heroMuted,
});

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

function IconBell() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 000 18c1.7 0 2-1 2-2v-1a2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-8-10z" />
      <circle cx={7.5} cy={10.5} r={1.2} fill="currentColor" />
      <circle cx={12} cy={7.5} r={1.2} fill="currentColor" />
      <circle cx={16.5} cy={10.5} r={1.2} fill="currentColor" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9} />
      <path d="M12 11v5M12 8h.01" strokeWidth={2.4} />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1={21} y1={12} x2={9} y2={12} />
    </svg>
  );
}
