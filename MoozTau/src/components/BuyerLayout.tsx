import { type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { LanguageCycleToggle } from "@/components/LanguageCycleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

type BuyerTab = {
  path: string;
  label: string;
  icon: ReactNode;
};

export function BuyerLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = useAuthStore((s) => s.fullName);

  const isDetail = /^\/buyer\/orders\/\d+/.test(location.pathname);
  const desktopTabs: BuyerTab[] = [
    { path: "/buyer/home", label: t("buyerNav.home", { defaultValue: "Главная" }), icon: <IconHome /> },
    { path: "/buyer/orders", label: t("buyerNav.orders", { defaultValue: "Заказы" }), icon: <IconOrders /> },
    { path: "/buyer/service", label: t("buyerNav.service", { defaultValue: "Сервис" }), icon: <IconLifeRing /> },
    { path: "/buyer/messages", label: t("buyerNav.messages", { defaultValue: "Сообщения" }), icon: <IconChat /> },
    { path: "/buyer/profile", label: t("buyerNav.profile", { defaultValue: "Профиль" }), icon: <IconUser /> },
  ];
  const mobileTabs = desktopTabs.filter((tab) => tab.path !== "/buyer/service");

  const firstName = fullName?.split(" ").find(Boolean) ?? "Покупатель";
  const initials = (fullName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="buyer-shell">
      <div className="buyer-shell-aurora buyer-shell-aurora-primary" />
      <div className="buyer-shell-aurora buyer-shell-aurora-secondary" />

      <header className="buyer-topnav">
        <div className="buyer-topnav-inner">
          <button type="button" className="buyer-topnav-brand" onClick={() => navigate("/buyer/home")}>
            <span className="buyer-topnav-logo">M</span>
            <span className="buyer-topnav-brand-copy">
              <strong>MoozTau</strong>
              <small>Портал покупателя</small>
            </span>
          </button>

          <nav className="buyer-topnav-links" aria-label="Навигация покупателя">
            {desktopTabs.map((tab) => (
              <button
                key={tab.path}
                type="button"
                className={`buyer-topnav-link${isActive(location.pathname, tab.path) ? " active" : ""}`}
                onClick={() => navigate(tab.path)}
              >
                <span className="buyer-topnav-link-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="buyer-topnav-actions">
            <div className="buyer-topnav-control">
              <LanguageCycleToggle compact />
            </div>
            <div className="buyer-topnav-control">
              <ThemeToggle compact />
            </div>
            <button
              type="button"
              className="buyer-topnav-user"
              onClick={() => navigate("/buyer/profile")}
              title={fullName ?? ""}
            >
              <span className="buyer-topnav-avatar">{initials}</span>
              <span className="buyer-topnav-user-copy">
                <strong>{firstName}</strong>
                <small>Мой кабинет</small>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="buyer-container">
        <Outlet />
      </div>

      {!isDetail && (
        <nav className="buyer-bottom-nav" aria-label="Навигация покупателя">
          <div className="buyer-bottom-nav-inner">
            {mobileTabs.map((tab) => (
              <BottomNavTab
                key={tab.path}
                label={tab.label}
                icon={tab.icon}
                active={isActive(location.pathname, tab.path)}
                onClick={() => navigate(tab.path)}
              />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

function isActive(current: string, path: string) {
  if (path === "/buyer/home") {
    return current === "/buyer/home" || current === "/buyer" || current === "/buyer/";
  }
  return current.startsWith(path);
}

function BottomNavTab({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button type="button" className={`buyer-bottom-nav-tab${active ? " active" : ""}`} onClick={onClick}>
      <span className="buyer-bottom-nav-tab-icon">{icon}</span>
      <span className="buyer-bottom-nav-tab-label">{label}</span>
    </button>
  );
}

function IconHome() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a7 7 0 01-7 7H7l-4 3v-5.2A7 7 0 0110 5h4a7 7 0 017 7z" />
    </svg>
  );
}

function IconLifeRing() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={4} />
      <path d="M15 9l4-4M9 9L5 5M15 15l4 4M9 15l-4 4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

