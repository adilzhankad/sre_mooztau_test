import { ORG_TYPE_LABELS, STATUS_FILTERS, TYPE_FILTERS } from "../constants";
import type { OrganizationStatusFilter, OrganizationTypeFilter } from "../types";

type OrganizationsToolbarProps = {
  count: number;
  search: string;
  statusFilter: OrganizationStatusFilter;
  typeFilter: OrganizationTypeFilter;
  canManage: boolean;
  showCreateForm: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: OrganizationStatusFilter) => void;
  onTypeFilterChange: (value: OrganizationTypeFilter) => void;
  onToggleCreateForm: () => void;
};

const STATUS_LABELS: Record<OrganizationStatusFilter, string> = {
  all: "Все",
  active: "Активные",
  inactive: "Неактивные",
};

export function OrganizationsToolbar({
  count,
  search,
  statusFilter,
  typeFilter,
  canManage,
  showCreateForm,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onToggleCreateForm,
}: OrganizationsToolbarProps) {
  return (
    <>
      <section className="orgs-topbar">
        <div>
          <h1 className="orgs-title">Организации</h1>
          <p className="orgs-subtitle">{count} в текущей выборке</p>
        </div>

        {canManage ? (
          <button className="orgs-primary-btn" type="button" onClick={onToggleCreateForm}>
            {showCreateForm ? "Скрыть форму" : "Добавить организацию"}
          </button>
        ) : null}
      </section>

      <section className="orgs-toolbar-card">
        <div className="orgs-search-wrap">
          <input
            className="orgs-input"
            type="search"
            value={search}
            placeholder="Поиск по названию, региону, адресу"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="orgs-filter-row">
          <select
            className="orgs-input orgs-select"
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as OrganizationStatusFilter)
            }
          >
            {STATUS_FILTERS.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>

          <select
            className="orgs-input orgs-select"
            value={typeFilter}
            onChange={(event) =>
              onTypeFilterChange(event.target.value as OrganizationTypeFilter)
            }
          >
            {TYPE_FILTERS.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "Все типы" : ORG_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </section>
    </>
  );
}
