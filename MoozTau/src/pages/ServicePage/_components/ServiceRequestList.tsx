import { Pagination } from "@/components/ui/Pagination";
import { useAuthStore } from "@/stores/auth-store";
import type { Paginated, ServiceMaster, ServiceRequest, ServiceRequestStatus, ServiceRequestUpdate } from "@/types";
import { SERVICE_STATUS_COLORS, SERVICE_STATUS_LABELS, SERVICE_STATUS_OPTIONS } from "../constants";

interface ServiceRequestListProps {
  data?: Paginated<ServiceRequest>;
  masters: ServiceMaster[];
  isLoading: boolean;
  isUpdating: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onUpdate: (id: number, payload: ServiceRequestUpdate) => void;
}

export function ServiceRequestList({
  data,
  masters,
  isLoading,
  isUpdating,
  onPrevPage,
  onNextPage,
  onUpdate,
}: ServiceRequestListProps) {
  const role = useAuthStore((state) => state.role);
  const isMaster = role === "MASTER";

  if (isLoading) {
    return (
      <div className="stack" style={{ gap: 8 }}>
        {[1, 2, 3].map((item) => (
          <div key={item} className="card" style={{ padding: 14 }}>
            <div className="skeleton" style={{ width: 220, height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "100%", height: 10 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="empty-state fade-up" style={{ padding: "48px 16px" }}>
        <p className="text-sm font-semibold text-default" style={{ marginBottom: 4 }}>
          Сервисных заявок пока нет
        </p>
        <p className="text-xs text-secondary">Создайте первую заявку по ремонту или гарантийному обслуживанию.</p>
      </div>
    );
  }

  return (
    <>
      <div className="stack" style={{ gap: 10 }}>
        {data.results.map((item) => {
          const badgeColor = SERVICE_STATUS_COLORS[item.status];
          return (
            <article key={item.id} className="card" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <strong>{item.ticket_number}</strong>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: `${badgeColor}18`,
                        color: badgeColor,
                      }}
                    >
                      {SERVICE_STATUS_LABELS[item.status]}
                    </span>
                    {item.warranty_case ? <span className="text-xs text-secondary">Гарантия</span> : null}
                  </div>
                  <p className="text-sm text-default" style={{ margin: "8px 0 0" }}>
                    {item.client_name} • {item.client_phone}
                  </p>
                  <p className="text-xs text-secondary" style={{ margin: "4px 0 0" }}>
                    {item.product_name}
                    {item.serial_number ? ` • SN ${item.serial_number}` : ""}
                    {item.organization_name ? ` • ${item.organization_name}` : ""}
                  </p>
                </div>
                <div className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</div>
              </div>

              <p className="text-sm text-default" style={{ margin: "12px 0 0" }}>{item.issue}</p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <select
                  className="input"
                  value={item.status}
                  onChange={(e) => onUpdate(item.id, { status: e.target.value as ServiceRequestStatus })}
                  disabled={isUpdating}
                >
                  {SERVICE_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{SERVICE_STATUS_LABELS[status]}</option>
                  ))}
                </select>

                <select
                  className="input"
                  value={item.assigned_master_id ?? ""}
                  onChange={(e) => onUpdate(item.id, { assigned_master_id: e.target.value ? Number(e.target.value) : null })}
                  disabled={isUpdating || isMaster}
                >
                  <option value="">Без мастера</option>
                  {masters.map((master) => (
                    <option key={master.id} value={master.id}>{master.full_name}</option>
                  ))}
                </select>

                <input
                  className="input"
                  type="datetime-local"
                  value={item.visit_date ? item.visit_date.slice(0, 16) : ""}
                  onChange={(e) => onUpdate(item.id, { visit_date: e.target.value || null })}
                  disabled={isUpdating}
                />
              </div>

              <textarea
                className="input"
                style={{ minHeight: 90, marginTop: 10 }}
                placeholder="Решение, комментарий мастера, результат ремонта"
                value={item.resolution_notes ?? ""}
                onChange={(e) => onUpdate(item.id, { resolution_notes: e.target.value || null })}
                disabled={isUpdating}
              />

              <div className="text-xs text-secondary" style={{ marginTop: 8 }}>
                Создал: {item.created_by_name || `#${item.created_by_id}`}
                {item.assigned_master_name ? ` • Мастер: ${item.assigned_master_name}` : ""}
              </div>
            </article>
          );
        })}
      </div>
      <Pagination page={data.page} pages={data.pages} onPrev={onPrevPage} onNext={onNextPage} />
    </>
  );
}
