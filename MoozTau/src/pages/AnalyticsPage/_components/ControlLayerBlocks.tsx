import { formatMoney } from "@/lib/order-helpers";
import { useThemeStore } from "@/stores/theme-store";
import type {
  ChannelStat,
  DeliveryAnalytics,
  FunnelCanonical,
  FunnelStages,
  QCAnalytics,
} from "@/types";
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/status-config";
import { AnalyticsCard } from "./AnalyticsBlocks";

type RGB = [number, number, number];

function mix(color: RGB, bg: RGB, t: number): string {
  const [r, g, b] = color.map((c, i) => Math.round(c * t + bg[i] * (1 - t)));
  return `rgb(${r}, ${g}, ${b})`;
}

function pct(cur: number, total: number): number {
  if (!total) return 0;
  return Math.round((cur / total) * 100);
}

function hours(h: number): string {
  if (h <= 0) return "—";
  if (h < 24) return `${h.toFixed(1)} ч`;
  const days = Math.floor(h / 24);
  const rem = Math.round(h - days * 24);
  return rem > 0 ? `${days} д ${rem} ч` : `${days} д`;
}

// ── Funnel block ────────────────────────────────────────────────────────────

export function FunnelBlock({ data }: { data?: FunnelCanonical; isLoading?: boolean }) {
  const stages: Array<{ key: keyof FunnelCanonical; label: string; color: RGB }> = [
    { key: "created", label: "Создано", color: [99, 102, 241] },
    { key: "paid", label: "Оплачено", color: [14, 165, 233] },
    { key: "in_production", label: "В производстве", color: [16, 185, 129] },
    { key: "completed", label: "Завершено", color: [34, 197, 94] },
    { key: "returned", label: "Возвраты", color: [234, 179, 8] },
    { key: "cancelled", label: "Отменено", color: [239, 68, 68] },
  ];
  const total = data?.created ?? 0;

  return (
    <AnalyticsCard
      title="Воронка"
      subtitle="Где теряются клиенты и на каком этапе застревают заказы"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((s) => {
          const value = data?.[s.key] ?? 0;
          const p = pct(value, total);
          return (
            <div key={s.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{s.label}</span>
                <span className="text-secondary">
                  {value.toLocaleString("ru-RU")} {total > 0 && s.key !== "created" ? `· ${p}%` : ""}
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 6,
                  background: "rgba(148,163,184,0.18)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(3, p))}%`,
                    height: "100%",
                    background: `rgb(${s.color.join(",")})`,
                    transition: "width .3s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

// ── Funnel stages block (9 stages) ──────────────────────────────────────────

const STAGE_ORDER: Array<keyof FunnelStages> = [
  "analysis",
  "in_progress",
  "qc_review",
  "qc_passed",
  "waiting_courier",
  "matching",
  "master_selected",
  "in_transit",
  "completed",
];

export function FunnelStagesBlock({ data }: { data?: FunnelStages }) {
  const stages = STAGE_ORDER;
  const max = Math.max(1, ...stages.map((k) => (data?.[k] ?? 0)));

  return (
    <AnalyticsCard
      title="Этапы заказа"
      subtitle="Где сейчас находятся заказы по всему жизненному циклу"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((key) => {
          const value = data?.[key] ?? 0;
          const widthPct = Math.max(3, Math.round((value / max) * 100));
          const color = STATUS_COLORS[key];
          return (
            <div key={key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{ORDER_STATUS_LABELS[key]}</span>
                <span className="text-secondary">{value.toLocaleString("ru-RU")}</span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 6,
                  background: "rgba(148,163,184,0.18)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: color,
                    transition: "width .3s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

// ── QC block ────────────────────────────────────────────────────────────────

export function QCBlock({ data }: { data?: QCAnalytics }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const failRate = data?.fail_rate ?? 0;
  const statColor = failRate > 25 ? "var(--danger)" : failRate > 10 ? "var(--warning)" : "var(--success)";

  return (
    <AnalyticsCard
      title="Контроль качества"
      subtitle="Как часто заказы не проходят QC — и на каких моделях"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Metric label="Проверок" value={(data?.total_checks ?? 0).toLocaleString("ru-RU")} />
        <Metric
          label="Отказов"
          value={`${(data?.total_rejected ?? 0).toLocaleString("ru-RU")}`}
          hint={`${failRate.toFixed(1)}%`}
          hintColor={statColor}
        />
        <Metric label="Ср. попыток" value={(data?.avg_attempts ?? 0).toFixed(2)} />
        <Metric
          label="Авто-отмена"
          value={(data?.auto_cancelled ?? 0).toLocaleString("ru-RU")}
          hint={(data?.auto_cancelled ?? 0) > 0 ? ">2 отказов" : ""}
        />
      </div>
      <div
        style={{
          borderTop: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.2)",
          paddingTop: 12,
          fontSize: 13,
        }}
      >
        <div className="text-secondary" style={{ marginBottom: 6 }}>
          Топ моделей с отказами
        </div>
        {(!data || (data.top_failed_products?.length ?? 0) === 0) && (
          <div className="text-secondary" style={{ fontSize: 12 }}>
            Нет данных за период
          </div>
        )}
        {(data?.top_failed_products ?? []).slice(0, 5).map((p) => (
          <div
            key={`${p.model}-${p.category}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span>
              {p.model}
              {p.category ? (
                <span className="text-secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                  · {p.category}
                </span>
              ) : null}
            </span>
            <span style={{ color: "var(--danger)", fontWeight: 600 }}>{p.fails}</span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}

// ── Delivery block ──────────────────────────────────────────────────────────

export function DeliveryBlock({ data }: { data?: DeliveryAnalytics }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  return (
    <AnalyticsCard
      title="Доставка и производство"
      subtitle="Сколько времени занимает каждый этап и что опаздывает"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <Metric label="Произв-во" value={hours(data?.avg_production_time_hours ?? 0)} />
        <Metric label="Доставка" value={hours(data?.avg_delivery_time_hours ?? 0)} />
        <Metric label="Полный цикл" value={hours(data?.avg_full_cycle_hours ?? 0)} />
        <Metric
          label="Доставлено"
          value={(data?.delivered_count ?? 0).toLocaleString("ru-RU")}
        />
        <Metric
          label="Опоздания"
          value={(data?.delayed_count ?? 0).toLocaleString("ru-RU")}
          hintColor={(data?.delayed_count ?? 0) > 0 ? "var(--danger)" : undefined}
        />
      </div>
      <div
        style={{
          borderTop: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.2)",
          paddingTop: 12,
        }}
      >
        <div className="text-secondary" style={{ marginBottom: 6, fontSize: 13 }}>
          Просроченные заказы
        </div>
        {(!data || (data.delayed_orders?.length ?? 0) === 0) && (
          <div className="text-secondary" style={{ fontSize: 12 }}>
            Нет просрочек — все заказы в срок
          </div>
        )}
        {(data?.delayed_orders ?? []).slice(0, 5).map((o) => (
          <div
            key={o.order_id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              fontSize: 13,
            }}
          >
            <span>
              {o.order_number}
              <span className="text-secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                · {o.status}
              </span>
            </span>
            <span style={{ color: "var(--danger)", fontWeight: 600 }}>+{o.days_late} д</span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}

// ── Channels block ──────────────────────────────────────────────────────────

export function ChannelsBlock({ channels }: { channels?: ChannelStat[] }) {
  const maxRevenue = Math.max(1, ...(channels ?? []).map((c) => c.revenue));
  return (
    <AnalyticsCard
      title="Каналы продаж"
      subtitle="Какие каналы дают выручку и какой процент доходит до завершения"
    >
      {(!channels || channels.length === 0) && (
        <div className="text-secondary" style={{ fontSize: 13 }}>
          Нет данных за период
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(channels ?? []).slice(0, 8).map((c) => {
          const convRate = c.orders_count
            ? Math.round((c.completed_count / c.orders_count) * 100)
            : 0;
          return (
            <div key={c.channel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{c.channel}</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(c.revenue)}</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "rgba(148,163,184,0.18)",
                  overflow: "hidden",
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    width: `${(c.revenue / maxRevenue) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #6366f1, #0ea5e9)",
                  }}
                />
              </div>
              <div className="text-secondary" style={{ fontSize: 12 }}>
                {c.orders_count} заказов · {c.completed_count} завершено ({convRate}%) · ср. чек {formatMoney(c.avg_check)}
              </div>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

// ── Shared metric cell ──────────────────────────────────────────────────────

function Metric({
  label,
  value,
  hint,
  hintColor,
}: {
  label: string;
  value: string;
  hint?: string;
  hintColor?: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "rgba(148,163,184,0.08)",
      }}
    >
      <div className="text-secondary" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{value}</div>
      {hint ? (
        <div style={{ fontSize: 12, marginTop: 2, color: hintColor || "var(--text-secondary)" }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

// Ensures unused mix helper stays tree-shakable if referenced later.
export { mix };
