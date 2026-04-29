import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrders, useSalesChannels } from "@/hooks/useOrders";
import { useOrderAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/auth-store";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from "@/lib/status-config";
import { canCreateOrder, orgFilterForRole, managerFilterForRole } from "@/lib/permissions";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/Input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { OrderCard } from "./_components/OrderCard";
import { OrdersTable } from "./_components/OrdersTable";
import { ItemsModal } from "./_components/ItemsModal";
import { Skeleton } from "./_components/Skeleton";
import { getSortOptions, ACTIVE_STATUSES, ARCHIVE_STATUSES } from "./_utils/helpers";
import type { AnyOrderStatus, OrderStatus, Order } from "@/types";

type OrdersTab = "active" | "archive";
type QuickPreset = "today" | "in_progress" | "delayed" | "paid" | null;

export function OrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const organizationId = useAuthStore((s) => s.organizationId);
  const userId = useAuthStore((s) => s.userId);
  const isDesktop = useIsDesktop();
  const upperRole = role?.toUpperCase() ?? "";

  const [tab, setTab] = useState<OrdersTab>("active");
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<OrderStatus[]>([]);
  const [channelFilters, setChannelFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("-order_date");
  const [page, setPage] = useState(1);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [quickPreset, setQuickPreset] = useState<QuickPreset>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const todayISO = new Date().toISOString().split("T")[0];

  const tabStatuses = tab === "active" ? ACTIVE_STATUSES : ARCHIVE_STATUSES;

  const commonFilters = {
    organization_id: orgFilterForRole(role, organizationId),
    manager_id: managerFilterForRole(role, userId),
  };

  const { data: rawChannels } = useSalesChannels();
  const channels = Array.isArray(rawChannels) ? rawChannels : [];

  const channelParam =
    channelFilters.length === 0 ||
    (channels.length > 0 && channelFilters.length === channels.length)
      ? undefined
      : channelFilters.length === 1
        ? channelFilters[0]
        : channelFilters;

  const { data: rawStats } = useOrderAnalytics({
    ...commonFilters,
    sales_channel: channelParam,
  });

  const orderStats = Array.isArray(rawStats) ? rawStats : [];
  const statusCountMap = useMemo(
    () => Object.fromEntries(orderStats.map((s) => [s.status, s.count])),
    [orderStats],
  );

  const activeTabTotal = useMemo(
    () => ACTIVE_STATUSES.reduce((sum, s) => sum + (statusCountMap[s] ?? 0), 0),
    [statusCountMap],
  );
  const archiveTabTotal = useMemo(
    () => ARCHIVE_STATUSES.reduce((sum, s) => sum + (statusCountMap[s] ?? 0), 0),
    [statusCountMap],
  );

  const dateFrom = quickPreset === "today" ? todayISO : undefined;
  const dateTo = quickPreset === "today" ? todayISO : undefined;
  const statusOverride: AnyOrderStatus | undefined = quickPreset === "paid" ? "paid" : undefined;

  const effectiveStatuses: AnyOrderStatus[] =
    quickPreset === "in_progress" || quickPreset === "delayed"
      ? (["in_progress", "qc_review", "waiting_courier", "in_transit"] satisfies OrderStatus[])
      : statusFilters.length
        ? statusFilters
        : tabStatuses;

  const statusParam: AnyOrderStatus | AnyOrderStatus[] =
    statusOverride
      ? statusOverride
      : effectiveStatuses.length === 1
        ? effectiveStatuses[0]
        : effectiveStatuses;

  const { data, isLoading, isError, refetch } = useOrders({
    ...commonFilters,
    search: search || undefined,
    status: statusParam,
    sales_channel: channelParam,
    ordering: sortBy || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
    page_size: 20,
  });

  const canCreate = canCreateOrder(role);
  const px = `var(--page-x${isDesktop ? "" : "-mobile"})`;

  const statusOptions = tabStatuses.map((s) => ({
    value: s,
    label: ORDER_STATUS_LABELS[s],
    dot: ORDER_STATUS_BADGE[s].dot,
  }));

  const channelOptions = channels.map((c) => ({ value: c, label: c }));

  const hasActiveFilters =
    quickPreset !== null || statusFilters.length > 0 || channelFilters.length > 0 || search.length > 0;

  const clearAll = () => {
    setQuickPreset(null);
    setStatusFilters([]);
    setChannelFilters([]);
    setSearch("");
    setPage(1);
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/") return;

      const el = e.target as HTMLElement | null;
      const tag = (el?.tagName ?? "").toLowerCase();
      const isTypingTarget =
        tag === "input" || tag === "textarea" || (el as any)?.isContentEditable;
      if (isTypingTarget) return;

      e.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const displayOrders = useMemo(() => {
    if (!data?.results) return [];
    if (quickPreset !== "delayed") return data.results;
    return data.results.filter((o) => isDelayed(o, todayISO));
  }, [data?.results, quickPreset, todayISO]);

  return (
    <div style={{ paddingBottom: isDesktop ? 0 : 88 }}>
      <div
        className="row"
        style={{
          padding: isDesktop
            ? `20px ${px} 0`
            : `calc(var(--safe-top) + 16px) ${px} 0`,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h1 className="page-title" style={{ margin: 0 }}>
          {t("ordersPage.title")}
          {data && (
            <span style={{
              marginLeft: 8, fontSize: 14, fontWeight: 500, color: "var(--text-muted)",
              verticalAlign: "middle",
            }}>
              {data.count}
            </span>
          )}
        </h1>
        {canCreate && isDesktop && (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/orders/new")}
            style={{ gap: 8 }}
          >
            <PlusIcon size={16} /> {t("ordersPage.newOrder")}
          </button>
        )}
      </div>

      <div
        style={{
          padding: `12px ${px} 0`,
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border-light)",
          marginTop: 4,
        }}
      >
        <TabButton
          active={tab === "active"}
          count={activeTabTotal}
          onClick={() => {
            setTab("active");
            setQuickPreset(null);
            setStatusFilters([]);
            setPage(1);
          }}
        >
          {t("ordersPage.tabs.active")}
        </TabButton>
        <TabButton
          active={tab === "archive"}
          count={archiveTabTotal}
          tone="muted"
          onClick={() => {
            setTab("archive");
            setQuickPreset(null);
            setStatusFilters([]);
            setPage(1);
          }}
        >
          {t("ordersPage.tabs.archive")}
        </TabButton>
      </div>

      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: `10px ${px} 0`,
          flexWrap: isDesktop ? "wrap" : "nowrap",
        }}
      >
        <QuickPill
          active={quickPreset === "today"}
          onClick={() => { setQuickPreset((p) => (p === "today" ? null : "today")); setPage(1); }}
        >
          {t("ordersPage.quick.today")}
        </QuickPill>
        <QuickPill
          active={quickPreset === "in_progress"}
          onClick={() => { setQuickPreset((p) => (p === "in_progress" ? null : "in_progress")); setPage(1); }}
        >
          {t("ordersPage.quick.inProgress")}
        </QuickPill>
        <QuickPill
          active={quickPreset === "delayed"}
          tone="warning"
          onClick={() => { setQuickPreset((p) => (p === "delayed" ? null : "delayed")); setPage(1); }}
        >
          {t("ordersPage.quick.delayed")}
        </QuickPill>
        <QuickPill
          active={quickPreset === "paid"}
          tone="success"
          onClick={() => { setQuickPreset((p) => (p === "paid" ? null : "paid")); setPage(1); }}
        >
          {t("ordersPage.quick.paid")}
        </QuickPill>
      </div>

      <div
        className="row"
        style={{
          padding: `12px ${px} 0`,
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t("ordersPage.searchPlaceholder")}
          inputRef={searchRef}
          style={{ maxWidth: isDesktop ? 320 : undefined, flex: 1, minWidth: 180 }}
        />

        <MultiSelect
          label={t("ordersPage.filters.statuses")}
          placeholder={t("ordersPage.filters.allStatuses")}
          options={statusOptions}
          selected={statusFilters}
          onChange={(v) => { setStatusFilters(v as OrderStatus[]); setQuickPreset(null); setPage(1); }}
          countMap={statusCountMap}
          searchable
          width={isDesktop ? 200 : "calc(50% - 4px)"}
        />

        {channels.length > 0 && (
          <MultiSelect
            label={t("ordersPage.filters.channels")}
            placeholder={t("ordersPage.filters.allChannels")}
            options={channelOptions}
            selected={channelFilters}
            onChange={(v) => { setChannelFilters(v); setPage(1); }}
            searchable={channels.length > 6}
            width={isDesktop ? 200 : "calc(50% - 4px)"}
          />
        )}

        <select
          className="input"
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          style={{ width: "auto", minWidth: 160 }}
        >
          {getSortOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              padding: "4px 6px",
              textDecoration: "underline",
            }}
          >
            {t("ordersPage.filters.clearAll")}
          </button>
        )}
      </div>

      {(statusFilters.length > 0 || channelFilters.length > 0) && (
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            padding: `10px ${px} 0`,
            flexWrap: isDesktop ? "wrap" : "nowrap",
          }}
        >
          {statusFilters.map((s) => {
            const badge = ORDER_STATUS_BADGE[s];
            return (
              <ActiveChip
                key={`s-${s}`}
                color={badge.dot}
                onRemove={() => {
                  setStatusFilters((prev) => prev.filter((v) => v !== s));
                  setPage(1);
                }}
              >
                {ORDER_STATUS_LABELS[s]}
              </ActiveChip>
            );
          })}
          {channelFilters.map((c) => (
            <ActiveChip
              key={`c-${c}`}
              onRemove={() => {
                setChannelFilters((prev) => prev.filter((v) => v !== c));
                setPage(1);
              }}
            >
              {c}
            </ActiveChip>
          ))}
        </div>
      )}

      <div
        style={{
          padding: `8px ${px} 0`,
          fontSize: 12,
          color: "var(--text-muted)",
          fontWeight: 500,
        }}
      >
        {t("ordersPage.found")}:{" "}
        <span style={{ color: "var(--text-default)", fontWeight: 700 }}>
          {data?.count ?? (tab === "active" ? activeTabTotal : archiveTabTotal)}
        </span>
      </div>

      <div style={{ padding: `8px ${px} 0` }}>
        {isLoading && <Skeleton desktop={isDesktop} />}
        {isError && <ErrorState description={t("ordersPage.loadError")} onRetry={refetch} />}

        {!isLoading && !isError && data?.results.length === 0 && (
          <EmptyState
            icon={<IconOrders />}
            title={t("ordersPage.emptyTitle")}
            description={hasActiveFilters ? t("ordersPage.emptyDescFiltered") : t("ordersPage.emptyDescEmpty")}
          />
        )}

        {isDesktop && data && data.results.length > 0 && (
          <OrdersTable orders={displayOrders} upperRole={upperRole} onShowItems={setModalOrder} />
        )}

        {!isDesktop && data && data.results.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            {displayOrders.map((o: Order) => (
              <OrderCard key={o.id} order={o} onShowItems={() => setModalOrder(o)} />
            ))}
          </div>
        )}
      </div>

      {data && data.pages > 1 && (
        <div style={{ padding: `16px ${px}` }}>
          <Pagination
            page={page}
            pages={data.pages}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      )}

      {canCreate && !isDesktop && (
        <button
          className="fab"
          onClick={() => navigate("/orders/new")}
          aria-label={t("ordersPage.newOrder")}
          style={{
            width: "auto",
            height: 52,
            borderRadius: 26,
            padding: "0 20px 0 16px",
            gap: 8,
            fontWeight: 600,
            fontSize: 14,
            color: "#333",
          }}
        >
          <PlusIcon size={20} />
          <span>{t("ordersPage.newOrder")}</span>
        </button>
      )}

      {modalOrder && (
        <ItemsModal order={modalOrder} onClose={() => setModalOrder(null)} />
      )}
    </div>
  );
}

function isDelayed(order: Order, todayISO: string): boolean {
  if (!order.deadline) return false;
  if (["completed", "returned", "cancelled", "rejected"].includes(order.status)) return false;
  return order.deadline < todayISO;
}

function QuickPill({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone?: "warning" | "success";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const bg = active
    ? tone === "warning"
      ? "var(--warning-light)"
      : tone === "success"
        ? "var(--success-light)"
        : "var(--bg-surface)"
    : "var(--bg-surface)";

  const border = active
    ? tone === "warning"
      ? "var(--warning)"
      : tone === "success"
        ? "var(--success)"
        : "var(--text-default)"
    : "var(--border)";

  const color = active
    ? tone === "warning"
      ? "var(--warning-fg)"
      : tone === "success"
        ? "var(--success-fg)"
        : "var(--text-default)"
    : "var(--text-secondary)";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  count,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 14px 12px",
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        color: active
          ? "var(--text-default)"
          : tone === "muted"
            ? "var(--text-muted)"
            : "var(--text-default)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>{children}</span>
      <span
        style={{
          padding: "1px 7px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          background: active ? "var(--text-default)" : "var(--border-light)",
          color: active ? "var(--bg-surface)" : "var(--text-muted)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count}
      </span>
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            background: "var(--text-default)",
            borderRadius: 2,
          }}
        />
      )}
    </button>
  );
}

function ActiveChip({
  children,
  color,
  onRemove,
}: {
  children: React.ReactNode;
  color?: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 6px 5px 10px",
        borderRadius: 999,
        background: "var(--bg-surface)",
        boxShadow: "inset 0 0 0 1.5px var(--border)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-default)",
      }}
    >
      {color && (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      )}
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="remove filter"
        style={{
          width: 16, height: 16, borderRadius: "50%",
          border: "none", background: "var(--border-light)",
          color: "var(--text-muted)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: 0,
        }}
      >
        <svg width={8} height={8} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c.98 0 1.813.626 2.115 1.5m-5.8 0c-.376.023-.75.05-1.124.08C7.095 3.007 6.25 3.97 6.25 5.108v13.642c0 1.243.996 2.25 2.25 2.25h6.5" />
    </svg>
  );
}

