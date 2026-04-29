import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { formatMoney } from "@/lib/order-helpers";
import { ORDER_STATUS_LABELS } from "@/lib/order-helpers";
import { useThemeStore } from "@/stores/theme-store";
import type { Order } from "@/types";
import type { AnalyticsNamedValue, AnalyticsProductRow } from "../types";

const COLORS = [
  "#1d5f7a",
  "#2e8a80",
  "#0f766e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const CARD_STYLE: React.CSSProperties = {
  padding: 18,
  borderRadius: 24,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,250,252,0.98) 100%)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 16px 34px rgba(15,23,42,0.07)",
};

function moneyFormatter(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFmtMoney = (value: any) => [formatMoney(Number(value)), "Выручка"];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipLabelFull = (label: any, payload: any) =>
  payload?.[0]?.payload?.fullName ?? String(label);

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
};

export function RevenueByMonthChart({ orders }: { orders: Order[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const byMonth: Record<string, { month: string; revenue: number; count: number }> = {};
  const monthNames = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
  ];

  for (const order of orders) {
    const d = new Date(order.order_date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const label = monthNames[d.getMonth()];
    if (!byMonth[key]) byMonth[key] = { month: label, revenue: 0, count: 0 };
    byMonth[key].revenue += order.final_amount;
    byMonth[key].count += 1;
  }

  const data = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  if (data.length < 2) return null;

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Динамика выручки</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Выручка и количество заказов по месяцам
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d5f7a" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1d5f7a" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} width={52} />
          <Tooltip
            formatter={(value: any, name: any) => [
              name === "revenue" ? formatMoney(Number(value)) : value,
              name === "revenue" ? "Выручка" : "Заказы",
            ]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1d5f7a"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
            name="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

export function StatusPieChart({ orders }: { orders: Order[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const grouped: Record<string, number> = {};
  for (const order of orders) {
    const label = ORDER_STATUS_LABELS[order.status] ?? order.status;
    grouped[label] = (grouped[label] ?? 0) + 1;
  }

  const data = Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return null;

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Распределение статусов</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Доля каждого статуса в общем объёме заказов
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [value, "Заказов"]}
            contentStyle={TOOLTIP_STYLE}
          />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}

export function TopProductsBarChart({ rows }: { rows: AnalyticsProductRow[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const data = rows.slice(0, 8).map((r) => ({
    name: r.name.length > 18 ? r.name.slice(0, 18) + "…" : r.name,
    fullName: r.name,
    value: r.value,
    quantity: r.quantity,
  }));

  if (data.length === 0) return null;

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Топ товаров по выручке</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Какие модели приносят больше всего денег
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
          <XAxis type="number" tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={tooltipFmtMoney}
            labelFormatter={tooltipLabelFull}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="value" fill="#2e8a80" radius={[0, 6, 6, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export function TopManagersBarChart({ rows }: { rows: AnalyticsNamedValue[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const data = rows.slice(0, 8).map((r) => ({
    name: r.name.length > 20 ? r.name.slice(0, 20) + "…" : r.name,
    fullName: r.name,
    value: r.value,
  }));

  if (data.length < 2) return null;

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Менеджеры по выручке</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Кто генерирует наибольший оборот
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} width={52} />
          <Tooltip
            formatter={tooltipFmtMoney}
            labelFormatter={tooltipLabelFull}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="value" fill="#1d5f7a" radius={[6, 6, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export function RegionsBarChart({ rows }: { rows: AnalyticsNamedValue[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const data = rows.slice(0, 8).map((r) => ({
    name: r.name.length > 16 ? r.name.slice(0, 16) + "…" : r.name,
    fullName: r.name,
    value: r.value,
  }));

  if (data.length < 2) return null;

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Выручка по регионам</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Географическое распределение продаж
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
          <XAxis type="number" tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={tooltipFmtMoney}
            labelFormatter={tooltipLabelFull}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
