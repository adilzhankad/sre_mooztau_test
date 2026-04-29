import { useMemo, useState } from "react";
import { useAuditLogs, useSuspiciousPatterns } from "@/hooks/useAudit";
import { useAuthStore } from "@/stores/auth-store";
import { canViewAudit } from "@/lib/permissions";
import type { AuditFilters } from "@/types";
import { AuditAccessDenied } from "./_components/AuditAccessDenied";
import { AuditFiltersPanel } from "./_components/AuditFilters";
import { AuditHero } from "./_components/AuditHero";
import { AuditLogList } from "./_components/AuditLogList";
import { AuditSuspiciousPanel } from "./_components/AuditSuspiciousPanel";
import { getSuspiciousCount } from "./utils";

const INITIAL_FILTERS: AuditFilters = {
  page: 1,
  page_size: 25,
};

export function AuditPage() {
  const role = useAuthStore((state) => state.role);
  const [tab, setTab] = useState<"logs" | "suspicious">("logs");
  const [filters, setFilters] = useState<AuditFilters>(INITIAL_FILTERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logsQuery = useAuditLogs(filters);
  const suspiciousQuery = useSuspiciousPatterns();

  const suspiciousCount = useMemo(
    () => getSuspiciousCount(suspiciousQuery.data),
    [suspiciousQuery.data],
  );
  const logItems = Array.isArray(logsQuery.data?.results) ? logsQuery.data.results : [];

  if (!canViewAudit(role)) {
    return <AuditAccessDenied />;
  }

  function updateFilter<K extends keyof AuditFilters>(key: K, value: AuditFilters[K] | undefined) {
    setExpandedId(null);
    setFilters((previous) => ({
      ...previous,
      page: 1,
      [key]: value,
    }));
  }

  function resetFilters() {
    setExpandedId(null);
    setFilters(INITIAL_FILTERS);
  }

  function refreshAll() {
    void logsQuery.refetch();
    void suspiciousQuery.refetch();
  }

  return (
    <div className="stack" style={{ padding: 16, gap: 16 }}>
      <AuditHero
        total={logItems.length}
        suspiciousCount={suspiciousCount}
        isRefreshing={logsQuery.isRefetching || suspiciousQuery.isRefetching}
        onRefresh={refreshAll}
      />

      <div className="row" style={{ gap: 8 }}>
        <button
          className={`btn btn-sm ${tab === "logs" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("logs")}
        >
          Журнал действий
        </button>
        <button
          className={`btn btn-sm ${tab === "suspicious" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("suspicious")}
        >
          Подозрительное
          {suspiciousCount > 0 ? (
            <span
              style={{
                marginLeft: 6,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {suspiciousCount}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "logs" ? (
        <>
          <AuditFiltersPanel filters={filters} onChange={updateFilter} onReset={resetFilters} />
          <AuditLogList
            data={logsQuery.data}
            isLoading={logsQuery.isLoading}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
            onPrevPage={() => setFilters((previous) => ({ ...previous, page: Math.max((previous.page ?? 1) - 1, 1) }))}
            onNextPage={() => setFilters((previous) => ({ ...previous, page: (previous.page ?? 1) + 1 }))}
          />
        </>
      ) : (
        <AuditSuspiciousPanel data={suspiciousQuery.data} />
      )}
    </div>
  );
}
