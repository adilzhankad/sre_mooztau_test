import { FACTORY_STATUS_OPTIONS, INVENTORY_STATUS_OPTIONS } from "../constants";
import type { FactoryFiltersState } from "../types";

interface Props {
  filters: FactoryFiltersState;
  manufacturers: string[];
  onChange: (patch: Partial<FactoryFiltersState>) => void;
}

export function FactoryFilters({ filters, manufacturers, onChange }: Props) {
  return (
    <section className="factory-section">
      <div className="factory-section__head">
        <div>
          <p className="factory-section__eyebrow">Фильтры</p>
          <h2 className="factory-section__title">Быстрый разбор по заказам и складу</h2>
        </div>
      </div>

      <div className="factory-filters">
        <label className="factory-field">
          <span className="label">Поиск</span>
          <input
            className="input"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Заказ, клиент, модель, регион"
          />
        </label>

        <label className="factory-field">
          <span className="label">Статус заказа</span>
          <select
            className="input"
            value={filters.orderStatus}
            onChange={(event) => onChange({ orderStatus: event.target.value })}
          >
            {FACTORY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="factory-field">
          <span className="label">Фабрика</span>
          <select
            className="input"
            value={filters.factory}
            onChange={(event) => onChange({ factory: event.target.value })}
          >
            <option value="">Все площадки</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer} value={manufacturer}>
                {manufacturer}
              </option>
            ))}
          </select>
        </label>

        <label className="factory-field">
          <span className="label">Статус склада</span>
          <select
            className="input"
            value={filters.inventoryStatus}
            onChange={(event) => onChange({ inventoryStatus: event.target.value })}
          >
            {INVENTORY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
