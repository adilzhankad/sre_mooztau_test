import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { canViewService } from "@/lib/permissions";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  useCreateServiceRequest,
  useServiceMasters,
  useServiceRequests,
  useUpdateServiceRequest,
  useTakeServiceRequest,
} from "@/hooks/useService";
import { useAuthStore } from "@/stores/auth-store";
import type {
  ServiceRequest,
  ServiceRequestCreate,
  ServiceRequestFilters,
  ServiceRequestStatus,
} from "@/types";
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_OPTIONS } from "./constants";
import { ServiceCreateForm } from "./_components/ServiceCreateForm";
import { ServiceRequestDrawer } from "./_components/ServiceRequestDrawer";

const INITIAL_FORM: ServiceRequestCreate = {
  client_name: "",
  client_phone: "",
  product_name: "",
  serial_number: "",
  issue: "",
  warranty_case: false,
  assigned_master_id: null,
  order_id: null,
  visit_date: null,
};

const STATUS_TONE: Record<ServiceRequestStatus, { fg: string; bg: string }> = {
  new:              { fg: "#1D4ED8", bg: "#DBEAFE" },
  matching:         { fg: "#7E22CE", bg: "#F3E8FF" },
  master_selected:  { fg: "#0369A1", bg: "#E0F2FE" },
  approval_pending: { fg: "#C2410C", bg: "#FFEDD5" },
  approved:         { fg: "#15803D", bg: "#DCFCE7" },
  in_progress:      { fg: "#A16207", bg: "#FEF3C7" },
  waiting_parts:    { fg: "#6D28D9", bg: "#EDE9FE" },
  completed:        { fg: "#15803D", bg: "#DCFCE7" },
  closed:           { fg: "#166534", bg: "#BBF7D0" },
  cancelled:        { fg: "#475569", bg: "#F1F5F9" },
};

type Tab = "all" | "mine" | "available" | "active" | "done";

export function ServicePage() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const isMaster = role === "MASTER";
  const isManager = role === "DEALER_ADMIN" || role === "DEALER_MANAGER" || role === "SUPER_ADMIN";

  const [tab, setTab] = useState<Tab>(isMaster ? "mine" : "active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | "">("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ServiceRequestCreate>(INITIAL_FORM);
  const [drawerId, setDrawerId] = useState<number | null>(null);

  const filters: ServiceRequestFilters = useMemo(() => {
    const base: ServiceRequestFilters = {
      page,
      page_size: 30,
      search: search || undefined,
    };
    if (statusFilter) base.status = statusFilter;

    if (isMaster) {
      if (tab === "mine") base.mine_only = true;
      else if (tab === "available") base.unassigned_only = true;
      // tab=all → all visible
    } else {
      if (tab === "active") {
        // активные — только не завершённые/отменённые: фильтруем клиентски, но
        // отдадим всё. Если выбран явный status — он берёт верх.
      } else if (tab === "done") {
        if (!statusFilter) base.status = "completed";
      }
    }
    return base;
  }, [page, search, statusFilter, tab, isMaster]);

  const { data, isLoading } = useServiceRequests(filters);
  const { data: masters } = useServiceMasters();
  const createMutation = useCreateServiceRequest();
  const updateMutation = useUpdateServiceRequest();
  const takeMutation = useTakeServiceRequest();

  if (!canViewService(role)) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>{t("servicePage.accessDenied.title")}</h2>
          <p className="text-sm text-secondary" style={{ margin: "10px 0 0" }}>
            {t("servicePage.accessDenied.description")}
          </p>
        </div>
      </div>
    );
  }

  // Клиентская фильтрация для tab=active (не-мастер): убираем completed/cancelled.
  const list = useMemo(() => {
    const items = data?.results ?? [];
    if (!isMaster && tab === "active" && !statusFilter) {
      return items.filter((r) => r.status !== "completed" && r.status !== "cancelled");
    }
    return items;
  }, [data, tab, isMaster, statusFilter]);

  const stats = useMemo(() => {
    const items = data?.results ?? [];
    return {
      total: data?.count ?? 0,
      newCount: items.filter((r) => r.status === "new").length,
      inProgress: items.filter((r) => r.status === "in_progress").length,
      waiting: items.filter((r) => r.status === "waiting_parts").length,
      completed: items.filter((r) => r.status === "completed").length,
    };
  }, [data]);

  async function handleCreate() {
    await createMutation.mutateAsync(form);
    setForm(INITIAL_FORM);
    setShowCreate(false);
  }

  const tabs: { id: Tab; label: string }[] = isMaster
    ? [
        { id: "mine", label: t("servicePage.tabs.mine") },
        { id: "available", label: t("servicePage.tabs.available") },
        { id: "all", label: t("servicePage.tabs.all") },
      ]
    : [
        { id: "active", label: t("servicePage.tabs.active") },
        { id: "done", label: t("servicePage.tabs.done") },
        { id: "all", label: t("servicePage.tabs.all") },
      ];

  const drawerItem = drawerId != null
    ? (data?.results ?? []).find((r) => r.id === drawerId) ?? null
    : null;

  return (
    <div
      className="service-page-wrap"
      style={{
        padding: "16px var(--page-x-mobile) calc(var(--safe-bottom, 0px) + 88px)",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div className="row-between" style={{ alignItems: "flex-start", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>
            {t("servicePage.kicker")}
          </p>
          <h1 className="page-title" style={{ margin: "2px 0 0" }}>
            {isMaster ? t("servicePage.titleMaster") : t("servicePage.title")}
          </h1>
        </div>
        {isManager && (
          <button
            className="btn btn-primary btn-md"
            onClick={() => setShowCreate((v) => !v)}
          >
            {t("servicePage.newRequest")}
          </button>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Stat label={t("servicePage.stats.total")} value={stats.total} tone="default" />
        <Stat label={t("servicePage.stats.new")} value={stats.newCount} tone="info" />
        <Stat label={t("servicePage.stats.inProgress")} value={stats.inProgress} tone="warn" />
        <Stat label={t("servicePage.stats.waiting")} value={stats.waiting} tone="purple" />
        <Stat label={t("servicePage.stats.completed")} value={stats.completed} tone="ok" />
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ marginBottom: 14 }}>
          <ServiceCreateForm
            value={form}
            masters={masters ?? []}
            isPending={createMutation.isPending}
            onChange={setForm}
            onSubmit={handleCreate}
            onClose={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Tabs + filters */}
      <div
        style={{
          display: "flex", gap: 8, alignItems: "center",
          flexWrap: "wrap",
          padding: "10px 0",
        }}
      >
        <div className="row" style={{ gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setPage(1); }}
              style={{
                background: tab === t.id ? "var(--text-default)" : "var(--bg-surface)",
                color: tab === t.id ? "var(--bg-surface)" : "var(--text-default)",
                border: tab === t.id ? "none" : "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder={t("servicePage.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 200, maxWidth: 360 }}
        />

        <select
          className="input"
          value={statusFilter}
          onChange={(e) => { setStatusFilter((e.target.value as ServiceRequestStatus) || ""); setPage(1); }}
          style={{ width: "auto", minWidth: 160 }}
        >
          <option value="">{t("servicePage.allStatuses")}</option>
          {SERVICE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{SERVICE_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="stack" style={{ gap: 10, marginTop: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 90 }}>
              <div className="skeleton" style={{ width: 200, height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 12 }} />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "var(--bg-subtle)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 12,
          }}>🔧</div>
          <p className="text-sm font-semibold text-default" style={{ margin: 0 }}>
            {tab === "mine" ? t("servicePage.empty.mine")
              : tab === "available" ? t("servicePage.empty.available")
              : t("servicePage.empty.default")}
          </p>
          {tab === "mine" && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => setTab("available")}
            >
              {t("servicePage.viewAvailable")}
            </button>
          )}
        </div>
      ) : (
        <div className="stack" style={{ gap: 10, marginTop: 8 }}>
          {list.map((item) => (
            <ServiceRow
              key={item.id}
              item={item}
              isMaster={isMaster}
              isManager={isManager}
              onOpen={() => setDrawerId(item.id)}
              onTake={() => takeMutation.mutate(item.id)}
              takeBusy={takeMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerItem && (
        <ServiceRequestDrawer
          item={drawerItem}
          masters={masters ?? []}
          isMaster={isMaster}
          isManager={isManager}
          isUpdating={updateMutation.isPending}
          onClose={() => setDrawerId(null)}
          onUpdate={(payload) =>
            updateMutation.mutate(
              { id: drawerItem.id, payload },
              {
                onSuccess: () => undefined,
                onError: (e) => {
                  // Surface backend rule violations (e.g. service.invalid_transition).
                  // Replace with toast system if you add one later.
                  alert(getApiErrorMessage(e));
                },
              },
            )
          }
        />
      )}
    </div>
  );
}

/* ── Stats ────────────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "info" | "warn" | "purple" | "ok";
}) {
  const palette = {
    default: { fg: "var(--text-default)", bg: "var(--bg-surface)" },
    info:    { fg: "#1D4ED8", bg: "#DBEAFE" },
    warn:    { fg: "#A16207", bg: "#FEF3C7" },
    purple:  { fg: "#6D28D9", bg: "#EDE9FE" },
    ok:      { fg: "#15803D", bg: "#DCFCE7" },
  }[tone];
  return (
    <div
      style={{
        background: palette.bg,
        border: "1px solid var(--border-light)",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <p style={{ margin: 0, fontSize: 11, color: palette.fg, fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: palette.fg }}>
        {value}
      </p>
    </div>
  );
}

/* ── Row ──────────────────────────────────────────────────────────────────── */

function ServiceRow({
  item,
  isMaster,
  isManager,
  onOpen,
  onTake,
  takeBusy,
}: {
  item: ServiceRequest;
  isMaster: boolean;
  isManager: boolean;
  onOpen: () => void;
  onTake: () => void;
  takeBusy: boolean;
}) {
  const { t, i18n } = useTranslation();
  const tone = STATUS_TONE[item.status];
  const dt = item.visit_date ? new Date(item.visit_date) : null;
  const dtLocale = i18n.language === "kk" ? "kk-KZ" : i18n.language === "en" ? "en-US" : "ru-RU";

  return (
    <div
      onClick={onOpen}
      role="button"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        padding: 14,
        cursor: "pointer",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 4,
          alignSelf: "stretch",
          background: tone.fg,
          borderRadius: 2,
          minHeight: 60,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-between" style={{ alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.3 }}>
              {item.ticket_number}
              {item.warranty_case && (
                <span style={{
                  marginLeft: 8,
                  padding: "1px 6px", borderRadius: 999,
                  background: "#dcfce7", color: "#15803d",
                  fontSize: 10, fontWeight: 700,
                }}>🛡 {t("servicePage.warranty")}</span>
              )}
            </p>
            <p style={{
              margin: "2px 0 0",
              fontSize: 15, fontWeight: 700, color: "var(--text-default)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {item.product_name}
            </p>
            <p style={{
              margin: "2px 0 0",
              fontSize: 12, color: "var(--text-secondary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {item.client_name} · {item.client_phone}
            </p>
          </div>

          <span style={{
            fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 999,
            background: tone.bg, color: tone.fg,
            whiteSpace: "nowrap",
          }}>
            {SERVICE_STATUS_LABELS[item.status]}
          </span>
        </div>

        <p
          className="text-xs text-secondary"
          style={{
            margin: "6px 0 0",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.issue}
        </p>

        <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          {dt ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999,
              background: "#DBEAFE", color: "#1D4ED8",
            }}>
              📅 {dt.toLocaleString(dtLocale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999,
              background: "var(--border-light)", color: "var(--text-muted)",
            }}>
              ⏳ {t("servicePage.noVisitDate")}
            </span>
          )}
          {item.assigned_master_name ? (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999,
              background: "var(--bg-subtle)", color: "var(--text-default)",
            }}>
              🧰 {item.assigned_master_name}
            </span>
          ) : (
            isMaster && item.status === "new" && (
              <button
                onClick={(e) => { e.stopPropagation(); onTake(); }}
                disabled={takeBusy}
                className="btn btn-primary btn-xs"
              >
                {takeBusy ? "…" : t("servicePage.takeInWork")}
              </button>
            )
          )}
          {isManager && !item.assigned_master_id && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: "3px 8px", borderRadius: 999,
              background: "#FEE2E2", color: "#B91C1C",
            }}>
              {t("servicePage.noMasterAssigned")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
