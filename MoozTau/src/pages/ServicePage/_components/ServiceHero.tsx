interface ServiceHeroProps {
  total: number;
  active: number;
  completed: number;
  onCreate: () => void;
}

export function ServiceHero({ total, active, completed, onCreate }: ServiceHeroProps) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 24,
        color: "#fff",
        background: "linear-gradient(135deg, #0f4c5c 0%, #1b6b73 45%, #4caf50 100%)",
        boxShadow: "0 18px 40px rgba(15,76,92,0.18)",
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
            Service Desk
          </div>
          <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.05 }}>
            Сервис и гарантийные заявки
          </h2>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.82)" }}>
            Фиксируйте поломки после продажи, назначайте мастера и ведите заявку до завершения ремонта.
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
            <span className="text-sm">Всего заявок</span>
            <strong>{total}</strong>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="text-sm">Активных</span>
            <strong>{active}</strong>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="text-sm">Закрытых</span>
            <strong>{completed}</strong>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onCreate}>
            Новая заявка
          </button>
        </div>
      </div>
    </section>
  );
}
