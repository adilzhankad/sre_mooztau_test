import type { BuyerOrder } from "@/types";
import { fullDate } from "../lib/format";
import { deriveStage } from "../lib/stage";

interface Props {
  order: BuyerOrder;
}

/** Lightweight SVG map — no external deps. Two points: pickup (склад) and drop (клиент). */
function MiniMap({ inTransit }: { inTransit: boolean }) {
  const gridStroke = "rgba(102, 112, 133, 0.18)";
  const lineStroke = "rgba(102, 112, 133, 0.55)";

  return (
    <svg viewBox="0 0 320 160" style={{ width: "100%", height: 160, background: "var(--buyer-surface-alt)" }}>
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke={gridStroke} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="160" fill="url(#grid)" />

      <line x1="50" y1="110" x2="270" y2="50" stroke={lineStroke} strokeWidth="3" strokeDasharray="6 6" />

      {/* pickup */}
      <g transform="translate(50,110)">
        <circle r="16" fill="var(--buyer-info)" />
        <path d="M 0 -6 L 6 4 L -6 4 Z" fill="#FFF" />
      </g>
      <text x="50" y="138" textAnchor="middle" fontSize="11" fill="var(--buyer-text)" fontWeight="800">
        Склад
      </text>

      {/* courier in transit (approx midpoint) */}
      {inTransit && (
        <g transform="translate(160,80)">
          <circle r="10" fill="var(--buyer-warning)">
            <animate attributeName="r" values="10;14;10" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle r="6" fill="#FFF" />
        </g>
      )}

      {/* drop */}
      <g transform="translate(270,50)">
        <circle r="16" fill="var(--buyer-success)" />
        <path d="M 0 -6 v 12 M -5 0 h 10" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <text x="270" y="30" textAnchor="middle" fontSize="11" fill="var(--buyer-text)" fontWeight="800">
        Клиент
      </text>
    </svg>
  );
}

export function DeliveryBlock({ order }: Props) {
  const stage = deriveStage(order);
  const inTransit = order.status === "in_transit";
  const delivered = order.status === "completed" || order.status === "accepted";

  if (!order.delivery_address && stage === "created") return null;

  const stateLabel = delivered ? "Доставлено" : inTransit ? "В пути" : "Ожидает отправки";
  const stateColor = delivered ? "var(--buyer-success)" : inTransit ? "var(--buyer-warning)" : "var(--buyer-muted)";

  return (
    <section className="buyer-surface" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 className="buyer-text" style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>
          Доставка
        </h2>
        <span style={{ fontSize: 12, fontWeight: 900, color: stateColor }}>{stateLabel}</span>
      </div>

      <MiniMap inTransit={inTransit} />

      <ol style={{ margin: 0, padding: "14px 16px 16px", display: "grid", gap: 12, listStyle: "none" }}>
        <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              marginTop: 2,
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "var(--buyer-info)",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            1
          </span>
          <div>
            <div className="buyer-muted" style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.7, textTransform: "uppercase" }}>
              Забор
            </div>
            <div className="buyer-text" style={{ fontSize: 13, fontWeight: 900 }}>
              Склад MoozTau
            </div>
            {order.dispatch_date && (
              <div className="buyer-muted" style={{ marginTop: 4, fontSize: 12 }}>
                Отправлен: {fullDate(order.dispatch_date)}
              </div>
            )}
          </div>
        </li>

        <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            style={{
              marginTop: 2,
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "var(--buyer-success)",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            2
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="buyer-muted" style={{ fontSize: 11, fontWeight: 900, letterSpacing: 0.7, textTransform: "uppercase" }}>
              Доставка
            </div>
            <div className="buyer-text" style={{ fontSize: 13, fontWeight: 900 }}>
              {order.delivery_address || "Адрес уточняется"}
            </div>
            {order.deadline && (
              <div className="buyer-muted" style={{ marginTop: 4, fontSize: 12 }}>
                к {fullDate(order.deadline)}
              </div>
            )}
          </div>
        </li>
      </ol>
    </section>
  );
}

