interface AnalyticsHeroProps {
  title: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function AnalyticsHero(props: AnalyticsHeroProps) {
  return (
    <section
      style={{
        padding: 18,
        borderRadius: 24,
        color: "#fff",
        background:
          "linear-gradient(135deg, #123c69 0%, #1d5f7a 45%, #2e8a80 100%)",
        boxShadow: "0 18px 40px rgba(18,60,105,0.18)",
      }}
    >
      <div
        className="hero-grid"
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
            Analytics Hub
          </div>
          <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.05 }}>
            {props.title}
          </h2>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.82)" }}>
            {props.description}
          </p>
        </div>
        <div
          style={{
            padding: 14,
            borderRadius: 20,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div className="row gap-2 hero-date-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <label
                className="form-label"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                От
              </label>
              <input
                className="input"
                type="date"
                value={props.dateFrom}
                onChange={(e) => props.onDateFromChange(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label
                className="form-label"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                До
              </label>
              <input
                className="input"
                type="date"
                value={props.dateTo}
                onChange={(e) => props.onDateToChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
