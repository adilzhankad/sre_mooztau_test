import { formatMoney } from "@/lib/order-helpers";
import { useThemeStore } from "@/stores/theme-store";
import type { FinTransaction } from "@/types";
import type { FinanceNamedValue, FinanceSummaryCard } from "../types";

export function FinanceCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
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
      <div
        className="row-between"
        style={{ gap: 12, marginBottom: 14, alignItems: "start" }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
          <p className="text-sm text-secondary" style={{ margin: "4px 0 0" }}>
            {subtitle}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function FinanceSummaryGrid({ cards }: { cards: FinanceSummaryCard[] }) {
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

export function FinanceRows({
  rows,
  money,
  highlight,
}: {
  rows: FinanceNamedValue[];
  money: boolean;
  highlight?: boolean;
}) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const max = rows.reduce((currentMax, row) => Math.max(currentMax, row.value), 0) || 1;

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((row, index) => (
        <div
          key={row.name}
          style={{
            padding: 14,
            borderRadius: 18,
            background:
              highlight && index === 0
                ? (isDark ? "rgba(15,118,110,0.16)" : "rgba(15,118,110,0.08)")
                : (isDark ? "rgba(30,41,59,0.72)" : "rgba(241,245,249,0.72)"),
            border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.16)",
          }}
        >
          <div className="row-between" style={{ marginBottom: 6, gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{row.name}</p>
              {row.note ? (
                <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
                  {row.note}
                </p>
              ) : null}
            </div>
            <span
              className="tabnum"
              style={{
                fontWeight: 800,
                color: highlight ? "#0f766e" : "var(--text-default)",
              }}
            >
              {money ? formatMoney(row.value) : row.value}
            </span>
          </div>
          <div className="progress-wrap" style={{ height: 10 }}>
            <div
              className="progress-bar"
              style={{
                width: `${(row.value / max) * 100}%`,
                background: highlight
                  ? "linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)"
                  : "linear-gradient(90deg, #dc2626 0%, #f97316 100%)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionsList({ rows }: { rows: FinTransaction[] }) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((tx) => (
        <div
          key={tx.id}
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
            <p style={{ margin: 0, fontWeight: 700 }}>
              {tx.comment || tx.category_l1_name || "Транзакция"}
            </p>
            <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
              {tx.counterparty_name || tx.initiator_name || "Без контрагента"}
              {tx.order_number ? ` · ${tx.order_number}` : ""}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              className="tabnum"
              style={{
                margin: 0,
                fontWeight: 800,
                color:
                  tx.transaction_type === "income"
                    ? "var(--success)"
                    : "var(--danger)",
              }}
            >
              {tx.transaction_type === "income" ? "+" : "-"}
              {formatMoney(tx.amount)}
            </p>
            <p className="text-xs text-muted" style={{ margin: "4px 0 0" }}>
              {tx.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountsList({
  dealerScope,
  dealerReceived,
  accounts,
}: {
  dealerScope: boolean;
  dealerReceived: number;
  accounts: { id: number; name: string; balance: number }[];
}) {
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div className="stack" style={{ gap: 10 }}>
      {dealerScope ? (
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: isDark ? "rgba(15,118,110,0.16)" : "rgba(15,118,110,0.08)",
            border: isDark ? "1px solid rgba(45,212,191,0.18)" : "1px solid rgba(15,118,110,0.14)",
          }}
        >
          <p className="text-xs text-secondary" style={{ margin: 0 }}>
            Деньги в вашем контуре
          </p>
          <p
            className="tabnum"
            style={{
              margin: "8px 0 0",
              fontSize: 26,
              fontWeight: 800,
              color: "#0f766e",
            }}
          >
            {formatMoney(dealerReceived)}
          </p>
        </div>
      ) : null}

      {accounts.map((account) => (
        <div
          key={account.id}
          className="row-between"
          style={{
            padding: 14,
            borderRadius: 18,
            background: isDark ? "rgba(30,41,59,0.72)" : "rgba(241,245,249,0.72)",
            border: isDark ? "1px solid rgba(148,163,184,0.14)" : "1px solid rgba(148,163,184,0.16)",
          }}
        >
          <span className="text-sm text-default">{account.name}</span>
          <span className="text-sm font-bold tabnum">
            {formatMoney(account.balance)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FinanceBlock({
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

export function FinanceSkeleton() {
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
