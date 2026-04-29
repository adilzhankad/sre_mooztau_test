interface ProfileInfoCardProps {
  title: string;
  description: string;
  rows: Array<{ label: string; value: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

export function ProfileInfoCard({
  title,
  description,
  rows,
  actionLabel,
  onAction,
}: ProfileInfoCardProps) {
  return (
    <section className="profile-card">
      <div className="profile-card-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actionLabel && onAction ? (
          <button className="profile-link-button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>

      <div className="profile-info-list">
        {rows.map((row) => (
          <div className="profile-info-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
