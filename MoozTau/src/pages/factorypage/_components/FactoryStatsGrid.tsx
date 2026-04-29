import { DASHBOARD_CARDS } from "../constants";
import type { FactoryDashboard } from "@/types";

export function FactoryStatsGrid({
  dashboard,
  isLoading,
}: {
  dashboard?: FactoryDashboard;
  isLoading: boolean;
}) {
  return (
    <section className="factory-section">
      <div className="factory-section__head">
        <div>
          <p className="factory-section__eyebrow">Сводка</p>
          <h2 className="factory-section__title">Ситуация по производству</h2>
        </div>
      </div>

      <div className="factory-stats-grid stagger">
        {isLoading
          ? DASHBOARD_CARDS.map((card) => (
              <div key={card.key} className="factory-stat-card">
                <div className="skeleton" style={{ width: 72, height: 32, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: 130, height: 14 }} />
              </div>
            ))
          : DASHBOARD_CARDS.map((card) => (
              <article key={card.key} className="factory-stat-card">
                <span className="factory-stat-card__accent" style={{ background: card.color }} />
                <p className="factory-stat-card__value">{dashboard?.[card.key] ?? 0}</p>
                <p className="factory-stat-card__label">{card.label}</p>
              </article>
            ))}
      </div>
    </section>
  );
}
