import { formatMoney } from "@/lib/order-helpers";
import { useThemeStore } from "@/stores/theme-store";
import type {
  AnalyticsListRow,
  AnalyticsMetricCard,
  AnalyticsNamedValue,
  AnalyticsProductRow,
} from "../types";

export function AnalyticsCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <section
      className="card"
      style={{
        padding: 18,
        borderRadius: 24,
        background: isDark
          ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,252,0.98) 100%)",
        border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.18)",
        boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : "0 16px 34px rgba(15,23,42,0.07)",
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        {subtitle}
      </p>
      {children}
    </section>
  );
}

export function MetricGrid({ cards }: { cards: AnalyticsMetricCard[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="card"
          style={{
            padding: 16,
            borderRadius: 22,
            background: isDark ? "#18212b" : "#fff",
            border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(15,23,42,0.06)",
            boxShadow: isDark ? "0 14px 30px rgba(0,0,0,0.2)" : "0 14px 30px rgba(15,23,42,0.06)",
          }}
        >
          <p className="text-xs text-secondary" style={{ margin: 0 }}>
            {card.label}
          </p>
          <p
            className="tabnum"
            style={{
              margin: "8px 0 4px",
              fontSize: 28,
              fontWeight: 800,
              color: card.color,
              letterSpacing: "-0.04em",
            }}
          >
            {card.value}
          </p>
          <p className="text-xs text-muted" style={{ margin: 0 }}>
            {card.note}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ListWithBars({
  rows,
  money,
}: {
  rows: AnalyticsListRow[];
  money: boolean;
}) {
  const max = rows.reduce((currentMax, row) => Math.max(currentMax, row.value), 0) || 1;

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((row) => (
        <div key={row.label}>
          <div className="row-between" style={{ marginBottom: 6, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p
                className="text-sm text-default"
                style={{ margin: 0, fontWeight: 600 }}
              >
                {row.label}
              </p>
              {row.sub ? (
                <p className="text-xs text-muted" style={{ margin: "2px 0 0" }}>
                  {row.sub}
                </p>
              ) : null}
            </div>
            <span className="text-sm font-bold tabnum">
              {money ? formatMoney(row.value) : row.value}
            </span>
          </div>
          <div className="progress-wrap" style={{ height: 10 }}>
            <div
              className="progress-bar"
              style={{
                width: `${(row.value / max) * 100}%`,
                background:
                  "linear-gradient(90deg, #1d5f7a 0%, #2e8a80 100%)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniColumns({
  leftTitle,
  leftRows,
  rightTitle,
  rightRows,
  money,
}: {
  leftTitle: string;
  leftRows: AnalyticsNamedValue[];
  rightTitle: string;
  rightRows: AnalyticsNamedValue[];
  money: boolean;
}) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}
    >
      {[
        { title: leftTitle, rows: leftRows },
        { title: rightTitle, rows: rightRows },
      ].map((column) => (
        <div
          key={column.title}
          style={{
            borderRadius: 18,
            padding: 14,
            background: isDark ? "rgba(30,41,59,0.72)" : "rgba(241,245,249,0.72)",
            border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.18)",
          }}
        >
          <p
            className="text-xs text-secondary"
            style={{
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {column.title}
          </p>
          <div className="stack" style={{ gap: 10 }}>
            {column.rows.map((row) => (
              <div key={row.name} className="row-between" style={{ gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <p
                    className="text-sm text-default"
                    style={{ margin: 0, fontWeight: 600 }}
                  >
                    {row.name}
                  </p>
                  <p className="text-xs text-muted" style={{ margin: "2px 0 0" }}>
                    {row.note}
                  </p>
                </div>
                <span className="text-sm font-bold tabnum">
                  {money ? formatMoney(row.value) : row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PeopleList({ rows }: { rows: AnalyticsNamedValue[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((row, index) => (
        <div
          key={row.name}
          className="row-between"
          style={{
            padding: 14,
            borderRadius: 18,
            background:
              index === 0
                ? (isDark ? "rgba(29,95,122,0.18)" : "rgba(29,95,122,0.08)")
                : (isDark ? "rgba(30,41,59,0.78)" : "rgba(241,245,249,0.75)"),
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{row.name}</p>
            <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
              {row.note}
            </p>
          </div>
          <span className="tabnum" style={{ fontWeight: 800, color: "#1d5f7a" }}>
            {formatMoney(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProductsList({ rows }: { rows: AnalyticsProductRow[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((row) => (
        <div
          key={row.name}
          className="row-between"
          style={{
            padding: 14,
            borderRadius: 18,
            background: isDark ? "rgba(30,41,59,0.72)" : "rgba(241,245,249,0.72)",
            border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.16)",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{row.name}</p>
            <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
              Продано {row.quantity} ед.
            </p>
          </div>
          <span className="tabnum" style={{ fontWeight: 800 }}>
            {formatMoney(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsBlock({
  text,
  pad,
}: {
  text: string;
  pad: number;
}) {
  return (
    <div
      className="card"
      style={{ margin: 16, padding: pad, textAlign: "center", borderRadius: 24 }}
    >
      {text}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="stack" style={{ gap: 14 }}>
      {[1, 2].map((item) => (
        <div key={item} className="card" style={{ padding: 18 }}>
          <div
            className="skeleton"
            style={{ width: "32%", height: 18, marginBottom: 10 }}
          />
          <div
            className="skeleton"
            style={{ width: "70%", height: 12, marginBottom: 18 }}
          />
          {[1, 2, 3].map((line) => (
            <div
              key={line}
              className="skeleton"
              style={{ width: "100%", height: 12, marginBottom: 10 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
