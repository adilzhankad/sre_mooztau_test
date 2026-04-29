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
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/order-helpers";
import { useThemeStore } from "@/stores/theme-store";
import type { FinTransaction } from "@/types";
import type { FinanceNamedValue } from "../types";

const COLORS = [
  "#0f766e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#1d5f7a",
  "#2e8a80",
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

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
};

export function IncomeExpenseChart({ transactions }: { transactions: FinTransaction[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const byMonth: Record<string, { month: string; income: number; expense: number }> = {};
  const monthNames = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
  ];

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const label = monthNames[d.getMonth()];
    if (!byMonth[key]) byMonth[key] = { month: label, income: 0, expense: 0 };
    if (tx.transaction_type === "income") {
      byMonth[key].income += tx.amount;
    } else {
      byMonth[key].expense += tx.amount;
    }
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
      <h3 style={{ margin: 0, fontSize: 18 }}>Доходы vs Расходы</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Сравнение поступлений и списаний по месяцам
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} width={52} />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatMoney(Number(value)),
              name === "income" ? "Доходы" : "Расходы",
            ]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend
            formatter={(value: string) => (value === "income" ? "Доходы" : "Расходы")}
          />
          <Bar dataKey="income" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export function CategoryPieChart({
  rows,
  title,
  subtitle,
}: {
  rows: FinanceNamedValue[];
  title: string;
  subtitle: string;
}) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const data = rows.slice(0, 8).map((r) => ({ name: r.name, value: r.value }));

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
      <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        {subtitle}
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
            label={({ name, percent }: { name?: string; percent?: number }) => {
              const n = name ?? "";
              return `${n.length > 14 ? n.slice(0, 14) + "…" : n} ${((percent ?? 0) * 100).toFixed(0)}%`;
            }}
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [formatMoney(Number(value)), "Сумма"]}
            contentStyle={TOOLTIP_STYLE}
          />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}

export function BalanceTrendChart({ transactions }: { transactions: FinTransaction[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const byDay: Record<string, { date: string; balance: number }> = {};
  let running = 0;

  for (const tx of sorted) {
    const key = tx.date;
    running += tx.transaction_type === "income" ? tx.amount : -tx.amount;
    byDay[key] = { date: key, balance: running };
  }

  const data = Object.values(byDay);
  if (data.length < 3) return null;

  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <section style={{
      ...CARD_STYLE,
      background: isDark
        ? "linear-gradient(180deg, rgba(20,27,36,0.98) 0%, rgba(17,24,39,0.96) 100%)"
        : CARD_STYLE.background,
      border: isDark ? "1px solid rgba(148,163,184,0.14)" : CARD_STYLE.border,
      boxShadow: isDark ? "0 16px 34px rgba(0,0,0,0.24)" : CARD_STYLE.boxShadow,
    }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Динамика баланса</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Кумулятивный баланс по дням за выбранный период
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={sampled}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickFormatter={(d: string) => {
              const parts = d.split("-");
              return `${parts[2]}.${parts[1]}`;
            }}
          />
          <YAxis tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} width={52} />
          <Tooltip
            formatter={(value: any) => [formatMoney(Number(value)), "Баланс"]}
            labelFormatter={(label: any) => {
              const parts = String(label).split("-");
              return `${parts[2]}.${parts[1]}.${parts[0]}`;
            }}
            contentStyle={TOOLTIP_STYLE}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#0f766e"
            strokeWidth={2.5}
            fill="url(#balanceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

export function InitiatorBarChart({ rows }: { rows: FinanceNamedValue[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const data = rows.slice(0, 8).map((r) => ({
    name: r.name.length > 18 ? r.name.slice(0, 18) + "…" : r.name,
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
      <h3 style={{ margin: 0, fontSize: 18 }}>Топ по обороту</h3>
      <p className="text-sm text-secondary" style={{ margin: "4px 0 14px" }}>
        Кто генерирует наибольший финансовый поток
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={moneyFormatter} tick={{ fontSize: 11 }} width={52} />
          <Tooltip
            formatter={(value: any) => [formatMoney(Number(value)), "Оборот"]}
            labelFormatter={(label: any, payload: any) =>
              payload?.[0]?.payload?.fullName ?? String(label)
            }
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
