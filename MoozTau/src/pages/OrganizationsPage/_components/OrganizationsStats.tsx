type OrganizationsStatsProps = {
  total: number;
  active: number;
  inactive: number;
};

export function OrganizationsStats({
  total,
  active,
  inactive,
}: OrganizationsStatsProps) {
  return (
    <section className="orgs-stats">
      <div className="orgs-stat-card">
        <span className="orgs-stat-value">{total}</span>
        <span className="orgs-stat-label">Всего организаций</span>
      </div>
      <div className="orgs-stat-card">
        <span className="orgs-stat-value orgs-stat-value--active">{active}</span>
        <span className="orgs-stat-label">Активных</span>
      </div>
      <div className="orgs-stat-card">
        <span className="orgs-stat-value orgs-stat-value--inactive">{inactive}</span>
        <span className="orgs-stat-label">Неактивных</span>
      </div>
    </section>
  );
}
