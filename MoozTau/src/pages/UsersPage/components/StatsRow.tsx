interface StatsRowProps {
  total: number;
  active: number;
  inactive: number;
}

export function StatsRow({ total, active, inactive }: StatsRowProps) {
  return (
    <div className="users-stats-row">
      <div className="users-stat-card">
        <span className="users-stat-num">{total}</span>
        <span className="users-stat-lbl">всего</span>
      </div>
      <div className="users-stat-card">
        <span className="users-stat-num users-stat-num--active">{active}</span>
        <span className="users-stat-lbl">активных</span>
      </div>
      <div className="users-stat-card">
        <span className="users-stat-num users-stat-num--inactive">{inactive}</span>
        <span className="users-stat-lbl">неактивных</span>
      </div>
    </div>
  );
}
