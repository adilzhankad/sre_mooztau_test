interface Props {
  desktop: boolean;
}

export function Skeleton({ desktop }: Props) {
  if (desktop) {
    return (
      <div className="table-wrap">
        <div style={{ padding: "9px 14px", background: "var(--bg-base)", borderBottom: "1px solid var(--border)", display: "flex", gap: 28 }}>
          {[80, 140, 80, 80, 72, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 10 }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", gap: 28, padding: "12px 14px", borderBottom: "1px solid var(--border-light)", alignItems: "center" }}>
            <div className="skeleton" style={{ width: 80,  height: 12 }} />
            <div className="skeleton" style={{ width: 140, height: 12 }} />
            <div className="skeleton" style={{ width: 80,  height: 12 }} />
            <div className="skeleton" style={{ width: 80,  height: 12 }} />
            <div className="skeleton" style={{ width: 72,  height: 20, borderRadius: 999 }} />
            <div className="skeleton" style={{ width: 60,  height: 12 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="order-card" style={{ cursor: "default", pointerEvents: "none" }}>
          <div className="skeleton" style={{ width: 4, flexShrink: 0, borderRadius: 0, height: "auto" }} />
          <div style={{ flex: 1, padding: "13px 14px" }}>
            <div className="row-between" style={{ marginBottom: 10 }}>
              <div className="skeleton" style={{ width: 110, height: 13 }} />
              <div className="skeleton" style={{ width: 72,  height: 18, borderRadius: 999 }} />
            </div>
            <div className="skeleton" style={{ width: 160, height: 11, marginBottom: 10 }} />
            <div className="row-between">
              <div className="skeleton" style={{ width: 90, height: 16 }} />
              <div className="skeleton" style={{ width: 60, height: 11 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
