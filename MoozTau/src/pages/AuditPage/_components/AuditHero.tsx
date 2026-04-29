interface AuditHeroProps {
  total: number;
  suspiciousCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AuditHero({
  total,
  suspiciousCount,
  isRefreshing,
  onRefresh,
}: AuditHeroProps) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 24,
        color: "#fff",
        background:
          "linear-gradient(135deg, #432371 0%, #714674 45%, #c06c84 100%)",
        boxShadow: "0 18px 40px rgba(67,35,113,0.18)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(260px, 0.7fr)",
          gap: 16,
          alignItems: "end",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Audit Center
          </div>
          <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.05 }}>
            Полный журнал действий по системе
          </h2>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.82)" }}>
            Здесь видны действия сотрудников, смены статусов и подозрительные паттерны.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gap: 10,
            padding: 14,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="text-sm">Записей на странице</span>
            <strong>{total}</strong>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="text-sm">Подозрительных событий</span>
            <strong>{suspiciousCount}</strong>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? "Обновляем..." : "Обновить"}
          </button>
        </div>
      </div>
    </section>
  );
}
