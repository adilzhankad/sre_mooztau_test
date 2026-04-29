export function OrderDetailSkeleton() {
  return (
    <div className="fade-up" style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* header */}
      <div className="mobile-header">
        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "var(--radius-md)" }} />
        <div className="skeleton" style={{ width: 180, height: 14 }} />
        <div className="skeleton" style={{ width: 72, height: 20, borderRadius: 999 }} />
      </div>

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* amount card */}
        <div className="card">
          <div className="skeleton" style={{ width: 90, height: 11, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 160, height: 28, marginBottom: 14 }} />
          <div className="skeleton" style={{ width: "100%", height: 6, borderRadius: 999 }} />
        </div>

        {/* client card */}
        <div className="card">
          <div className="skeleton" style={{ width: 140, height: 13, marginBottom: 16 }} />
          {[1,2,3].map((i) => (
            <div key={i} className="info-row" style={{ borderBottom: "1px solid var(--border-light)" }}>
              <div className="skeleton" style={{ width: 80, height: 11 }} />
              <div className="skeleton" style={{ width: 120, height: 11 }} />
            </div>
          ))}
        </div>

        {/* items card */}
        <div className="card">
          <div className="skeleton" style={{ width: 70, height: 13, marginBottom: 14 }} />
          {[1,2].map((i) => (
            <div key={i} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 8 }}>
              <div className="skeleton" style={{ width: 140, height: 12, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 90, height: 10 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
