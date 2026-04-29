import type { AuditFilters } from "@/types";
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from "../constants";
import { getActionLabel, getResourceLabel } from "../utils";

interface AuditFiltersProps {
  filters: AuditFilters;
  onChange: <K extends keyof AuditFilters>(key: K, value: AuditFilters[K] | undefined) => void;
  onReset: () => void;
}

export function AuditFiltersPanel({ filters, onChange, onReset }: AuditFiltersProps) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <select
          className="input"
          value={filters.resource_type ?? ""}
          onChange={(e) => onChange("resource_type", e.target.value || undefined)}
        >
          <option value="">Все ресурсы</option>
          {AUDIT_RESOURCE_OPTIONS.map((resourceType) => (
            <option key={resourceType} value={resourceType}>
              {getResourceLabel(resourceType)}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={filters.action ?? ""}
          onChange={(e) => onChange("action", e.target.value || undefined)}
        >
          <option value="">Все действия</option>
          {AUDIT_ACTION_OPTIONS.map((action) => (
            <option key={action} value={action}>
              {getActionLabel(action)}
            </option>
          ))}
        </select>

        <input
          className="input"
          type="number"
          min={1}
          placeholder="ID пользователя"
          value={filters.user_id ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim();
            onChange("user_id", value ? Number(value) : undefined);
          }}
        />

        <input
          className="input"
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => onChange("date_from", e.target.value || undefined)}
        />

        <input
          className="input"
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => onChange("date_to", e.target.value || undefined)}
        />

        <button className="btn btn-secondary btn-sm" onClick={onReset}>
          Сбросить фильтры
        </button>
      </div>
    </section>
  );
}
