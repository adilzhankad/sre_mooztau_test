import { STAGE_ORDER, stageIndex, type BuyerStage } from "../lib/stage";

const VISIBLE: { stage: BuyerStage; label: string }[] = [
  { stage: "created", label: "Создан" },
  { stage: "matching", label: "Подбор" },
  { stage: "master_selected", label: "Выбор" },
  { stage: "approval_pending", label: "Подтв." },
  { stage: "approved", label: "Старт" },
  { stage: "in_progress", label: "В работе" },
  { stage: "completed", label: "Готово" },
  { stage: "closed", label: "Закрыт" },
];

interface Props {
  current: BuyerStage;
  compact?: boolean;
}

export function Timeline({ current, compact }: Props) {
  if (current === "cancelled") {
    return (
      <div
        className="buyer-surface"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "var(--buyer-danger-soft)",
          color: "var(--buyer-danger)",
          border: "1px solid rgba(181, 71, 8, 0.2)",
          borderRadius: 20,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--buyer-danger)" }} />
        Заказ отменён
      </div>
    );
  }

  const cur = stageIndex(current);
  const dot = (active: boolean, reached: boolean) => {
    if (active) return "var(--buyer-accent)";
    if (reached) return "var(--buyer-success)";
    return "var(--buyer-surface-muted)";
  };
  const text = (active: boolean, reached: boolean) => {
    if (active) return "var(--buyer-accent-deep)";
    if (reached) return "var(--buyer-success)";
    return "var(--buyer-muted)";
  };
  const track = (reached: boolean) => (reached ? "rgba(2, 122, 72, 0.36)" : "rgba(102, 112, 133, 0.18)");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: compact ? 4 : 6 }}>
      {VISIBLE.map((v, i) => {
        const idx = STAGE_ORDER.indexOf(v.stage);
        const active = v.stage === current;
        const reached = idx !== -1 && idx <= cur;
        const nextReached =
          i < VISIBLE.length - 1 && STAGE_ORDER.indexOf(VISIBLE[i + 1].stage) !== -1 && STAGE_ORDER.indexOf(VISIBLE[i + 1].stage) <= cur;

        return (
          <div key={v.stage} style={{ position: "relative", display: "flex", flex: 1, flexDirection: "column", alignItems: "center" }}>
            {i < VISIBLE.length - 1 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  width: "100%",
                  height: 2,
                  background: track(nextReached),
                }}
              />
            )}

            <span
              style={{
                position: "relative",
                zIndex: 1,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: dot(active, reached),
                boxShadow: "0 0 0 5px rgba(255, 255, 255, 0.42)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {reached && !active && (
                <svg viewBox="0 0 20 20" width={12} height={12} fill="white">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.58l6.3-6.3a1 1 0 011.4 0z" />
                </svg>
              )}
              {active && <span style={{ width: 6, height: 6, borderRadius: 999, background: "white" }} />}
            </span>

            {!compact && (
              <span
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  textAlign: "center",
                  color: text(active, reached),
                }}
              >
                {v.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

