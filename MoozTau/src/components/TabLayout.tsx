import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/useAuth";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { LanguageCycleToggle } from "@/components/LanguageCycleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
  roles: readonly string[];
  group: "work" | "reports" | "admin" | "profile";
}

const NAV: NavItem[] = [
  {
    path: "/orders",
    labelKey: "nav.orders",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 011.15.564m-5.8 0c-.376.023-.75.05-1.124.08C7.095 3.007 6.25 3.97 6.25 5.108v13.642c0 1.243.996 2.25 2.25 2.25h6.5",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER", "FACTORY_ADMIN", "FACTORY_WORKER"],
    group: "work",
  },
  {
    path: "/products",
    labelKey: "nav.products",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER"],
    group: "work",
  },
  {
    path: "/factory",
    labelKey: "nav.factory",
    icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
    roles: ["SUPER_ADMIN", "FACTORY_ADMIN", "FACTORY_WORKER", "QC_INSPECTOR"],
    group: "work",
  },
  {
    path: "/qc",
    labelKey: "nav.qc",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    roles: ["QC_INSPECTOR"],
    group: "work",
  },
  {
    path: "/logistics",
    labelKey: "nav.logistics",
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.75m0 0V11.25m0 3h8.25m-8.25 0V8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v5.625m0 0h3.75m0 0V11.25",
    roles: ["LOGISTICS"],
    group: "work",
  },
  {
    path: "/service",
    labelKey: "nav.service",
    icon: "M11.25 4.5l1.5-1.5 3.75 3.75-1.5 1.5m-8.25 8.25l6-6m-7.5 7.5L3 21l3.75-1.5m10.5-9.75l1.5 1.5m-10.5 1.5l3 3",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER", "MASTER"],
    group: "work",
  },
  {
    path: "/master/deliveries",
    labelKey: "nav.deliveries",
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.75m0 0V11.25m0 3h8.25m-8.25 0V8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v5.625m0 0h3.75m0 0V11.25",
    roles: ["MASTER"],
    group: "work",
  },
  {
    path: "/analytics",
    labelKey: "nav.analytics",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER", "FACTORY_ADMIN", "QC_INSPECTOR", "LOGISTICS"],
    group: "reports",
  },
  {
    path: "/finances",
    labelKey: "nav.finances",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER"],
    group: "reports",
  },
  {
    path: "/audit",
    labelKey: "nav.audit",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    roles: ["SUPER_ADMIN"],
    group: "reports",
  },
  {
    path: "/monitoring",
    labelKey: "nav.monitoring",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    roles: ["SUPER_ADMIN"],
    group: "reports",
  },
  {
    path: "/chat",
    labelKey: "nav.chat",
    icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER", "FACTORY_ADMIN", "FACTORY_WORKER"],
    group: "work",
  },
  {
    path: "/users",
    labelKey: "nav.users",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN"],
    group: "admin",
  },
  {
    path: "/organizations",
    labelKey: "nav.organizations",
    icon: "M2.25 21h19.5M3.75 3v18m16.5-18v18M6 6.75h.75M6 9.75h.75M6 12.75h.75m3-6h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER"],
    group: "admin",
  },
  {
    path: "/profile",
    labelKey: "nav.profile",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    roles: ["SUPER_ADMIN", "DEALER_ADMIN", "DEALER_MANAGER", "FACTORY_ADMIN", "FACTORY_WORKER", "QC_INSPECTOR", "LOGISTICS", "MASTER"],
    group: "profile",
  },
];

export function TabLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const fullName = useAuthStore((s) => s.fullName);
  const organizationName = useAuthStore((s) => s.organizationName);
  const { logout } = useLogout();
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(false);

  const upperRole = role?.toUpperCase() ?? "";
  const visibleItems = NAV.filter((item) => upperRole && item.roles.includes(upperRole));

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (isDesktop) {
    const sidebarWidth = collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)";
    const groups: { key: string; label?: string; items: NavItem[] }[] = [];
    let lastGroup = "";

    for (const item of visibleItems) {
      if (item.group !== lastGroup) {
        const label = item.group !== "profile" ? t(`nav.${item.group}`) : undefined;
        groups.push({ key: item.group, label, items: [] });
        lastGroup = item.group;
      }
      groups[groups.length - 1].items.push(item);
    }

    return (
      <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
        <aside
          style={{
            width: sidebarWidth,
            background: "var(--sidebar-bg)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            borderRight: "1px solid var(--sidebar-border)",
            transition: "width 200ms ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "16px 0" : "16px 14px",
              justifyContent: collapsed ? "center" : "flex-start",
              minHeight: 54,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-md)",
                background: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 800, color: "#333" }}>M</span>
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.3px",
                    display: "block",
                  }}
                >
                  MoozTau
                </span>
                {organizationName && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {organizationName}
                  </span>
                )}
              </div>
            )}
          </div>

          <hr style={{ height: 1, background: "var(--sidebar-border)", border: "none", margin: "0 10px 4px" }} />

          <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "0 4px" : "0 8px" }}>
            {groups.map((group, gi) => (
              <div key={group.key}>
                {group.label && !collapsed && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: gi === 0 ? "6px 13px 4px" : "14px 13px 4px",
                    }}
                  >
                    {group.label}
                  </div>
                )}
                {collapsed && gi > 0 && (
                  <hr style={{ height: 1, background: "var(--sidebar-border)", border: "none", margin: "6px 4px" }} />
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  const label = t(item.labelKey);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`nav-link${isActive ? " active" : ""}`}
                      title={collapsed ? label : undefined}
                      style={
                        collapsed
                          ? {
                              justifyContent: "center",
                              padding: "8px 0",
                              borderLeft: "none",
                              borderRight: isActive ? "3px solid var(--brand)" : "3px solid transparent",
                            }
                          : undefined
                      }
                    >
                      <NavIcon path={item.icon} active={isActive} />
                      {!collapsed && label}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          <div style={{ padding: "8px", borderTop: "1px solid var(--sidebar-border)" }}>
            {collapsed ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "4px 0" }}>
                <div className="avatar avatar-sm" style={{ fontSize: 10 }}>{initials}</div>
                <button
                  onClick={logout}
                  title={t("nav.logout")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.28)",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "9px 10px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div className="avatar avatar-md" style={{ fontSize: 11 }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{fullName}</p>
                  <p className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{organizationName}</p>
                </div>
                <button
                  onClick={logout}
                  title={t("nav.logout")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.28)",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    alignItems: "center",
                    transition: "color var(--t-base)",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.28)";
                  }}
                >
                  <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </aside>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header
            style={{
              height: "var(--header-height)",
              padding: "0 var(--page-x)",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                color: "var(--text-secondary)",
                transition: "color var(--t-base)",
              }}
              title={collapsed ? t("nav.expandMenu") : t("nav.collapseMenu")}
            >
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div
              style={{
                flex: 1,
                maxWidth: 480,
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 12px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                transition: "border-color var(--t-base), box-shadow var(--t-base)",
              }}
            >
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "var(--text-default)",
                  boxShadow: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <LanguageCycleToggle />
              <ThemeToggle />

              <button
                type="button"
                onClick={() => navigate("/profile#preferences")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-muted)",
                  position: "relative",
                  transition: "color var(--t-base)",
                }}
                title={t("nav.notifications")}
                aria-label={t("nav.notifications")}
              >
                <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                title={t("nav.profile")}
                aria-label={t("nav.profile")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="avatar avatar-sm" style={{ fontSize: 10, cursor: "pointer" }}>{initials}</div>
              </button>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)" }}>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  const bottomTabs = visibleItems.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg-base)" }}>
      <div
        className="floating-switchers"
        style={{
          position: "fixed",
          top: "calc(var(--safe-top, 0px) + 12px)",
          right: 12,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <LanguageCycleToggle compact />
        <ThemeToggle compact />
      </div>
      <main style={{ flex: 1, overflowY: "auto" }}>
        <Outlet />
      </main>

      <nav style={{ padding: "6px 10px", paddingBottom: "calc(var(--safe-bottom, 0px) + 6px)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            height: 52,
            borderRadius: 32,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {bottomTabs.map((tab) => (
            <MobileTab key={tab.path} item={tab} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      style={{ flexShrink: 0 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function MobileTab({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        padding: "3px 0",
        gap: 2,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isActive ? "var(--brand)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background var(--t-base)",
        }}
      >
        <svg
          width={17}
          height={17}
          fill="none"
          viewBox="0 0 24 24"
          stroke={isActive ? "#333" : "var(--text-secondary)"}
          strokeWidth={isActive ? 2 : 1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
        </svg>
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? "var(--text-default)" : "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          lineHeight: 1,
        }}
      >
        {t(item.labelKey)}
      </span>
    </NavLink>
  );
}
