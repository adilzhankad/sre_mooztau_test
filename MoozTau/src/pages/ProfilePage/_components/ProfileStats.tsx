interface ProfileStatsProps {
  stats: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <section className="profile-stats-grid">
      {stats.map((item) => (
        <article className="profile-stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.hint}</p>
        </article>
      ))}
    </section>
  );
}
