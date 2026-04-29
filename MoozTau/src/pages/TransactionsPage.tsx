import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/useFinance";
import { formatMoney, formatDate } from "@/lib/order-helpers";
import type { TransactionType } from "@/types";

export function TransactionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useTransactions({
    search: search || undefined,
    type: typeFilter || undefined,
    page,
    page_size: 30,
  });

  return (
    <div>
      {/* Header */}
      <div className="mobile-header">
        <button
          className="btn btn-ghost btn-sm"
          style={{ gap: 4 }}
          onClick={() => navigate("/finances")}
        >
          <ChevronLeft /> Финансы
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary btn-sm"
          style={{ gap: 5 }}
          onClick={() => navigate("/finances/transactions/new")}
        >
          <PlusIcon /> Новая
        </button>
      </div>

      {/* Filters */}
      <div className="row gap-2" style={{ padding: "12px 16px 0" }}>
        <input
          className="input"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{ flex: 1, minWidth: 0 }}
        />
        <select
          className="input"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as TransactionType | "");
            setPage(1);
          }}
          style={{ width: "auto" }}
        >
          <option value="">Все</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </select>
      </div>

      {/* List */}
      <div className="stack" style={{ padding: "12px 16px 16px", gap: 8 }}>
        {isLoading && (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="row-between">
                <div className="skeleton" style={{ width: 160, height: 13, marginBottom: 4 }} />
                <div className="skeleton" style={{ width: 80, height: 13 }} />
              </div>
              <div className="skeleton" style={{ width: 100, height: 11, marginTop: 4 }} />
            </div>
          ))
        )}

        {isError && (
          <p
            className="text-sm"
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--danger)",
            }}
          >
            Ошибка загрузки
          </p>
        )}

        {data && data.results.length === 0 && (
          <div
            className="empty-state fade-up"
            style={{ padding: "48px 16px" }}
          >
            <p className="text-sm text-muted">Нет транзакций</p>
          </div>
        )}

        {data?.results.map((tx) => (
          <div key={tx.id} className="card">
            <div className="row-between" style={{ alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  className="text-sm font-medium text-default"
                  style={{
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tx.counterparty_name || tx.comment || "Без описания"}
                </p>
                <div className="row gap-2" style={{ marginTop: 2 }}>
                  {tx.category_l1_name && (
                    <span className="text-xs text-secondary">
                      {tx.category_l1_name}
                    </span>
                  )}
                  {tx.order_number && (
                    <span className="text-xs text-brand">
                      {tx.order_number}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  className="text-sm font-semibold tabnum"
                  style={{
                    margin: 0,
                    color:
                      tx.transaction_type === "income"
                        ? "var(--success)"
                        : "var(--danger)",
                  }}
                >
                  {tx.transaction_type === "income" ? "+" : "−"}
                  {formatMoney(tx.amount)}
                </p>
                <p className="text-xs text-muted" style={{ margin: "2px 0 0" }}>
                  {formatDate(tx.date)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div
            className="row center gap-4"
            style={{ paddingTop: 8 }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Назад
            </button>
            <span className="text-sm text-secondary">
              {page} / {data.pages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
