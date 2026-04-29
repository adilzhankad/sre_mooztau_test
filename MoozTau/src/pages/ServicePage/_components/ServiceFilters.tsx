import type { ServiceMaster, ServiceRequestFilters } from "@/types";
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_OPTIONS } from "../constants";

interface ServiceFiltersProps {
  filters: ServiceRequestFilters;
  masters: ServiceMaster[];
  onChange: <K extends keyof ServiceRequestFilters>(
    key: K,
    value: ServiceRequestFilters[K] | undefined,
  ) => void;
  onReset: () => void;
}

export function ServiceFilters({ filters, masters, onChange, onReset }: ServiceFiltersProps) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <input
          className="input"
          placeholder="Поиск по клиенту, товару, номеру"
          value={filters.search ?? ""}
          onChange={(event) => onChange("search", event.target.value || undefined)}
        />
        <select
          className="input"
          value={filters.status ?? ""}
          onChange={(event) => onChange("status", (event.target.value || undefined) as ServiceRequestFilters["status"])}
        >
          <option value="">Все статусы</option>
          {SERVICE_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {SERVICE_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.assigned_master_id ?? ""}
          onChange={(event) => onChange("assigned_master_id", event.target.value ? Number(event.target.value) : undefined)}
        >
          <option value="">Все мастера</option>
          {masters.map((master) => (
            <option key={master.id} value={master.id}>
              {master.full_name}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={onReset}>
          Сбросить
        </button>
      </div>
    </section>
  );
}
