const GRAFANA_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

export function GrafanaPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Мониторинг</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Grafana — дашборды и метрики</p>
        </div>
        <a
          href={GRAFANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{ fontSize: 13 }}
        >
          Открыть в новой вкладке ↗
        </a>
      </div>

      <iframe
        src={GRAFANA_URL}
        style={{ flex: 1, border: "none", width: "100%" }}
        title="Grafana"
        allow="fullscreen"
      />
    </div>
  );
}
