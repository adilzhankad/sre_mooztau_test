import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateTransaction,
  useCategories,
  useAccounts,
} from "@/hooks/useFinance";
import type { TransactionType } from "@/types";

export function CreateTransactionPage() {
  const navigate = useNavigate();
  const createTx = useCreateTransaction();
  const { data: categories } = useCategories({ level: 1 });
  const { data: accounts } = useAccounts();

  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState<number | "">("");
  const [categoryL1, setCategoryL1] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [counterparty, setCounterparty] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || !accountId) return;

    createTx.mutate(
      {
        transaction_type: txType,
        amount: parsedAmount,
        date,
        account_id: accountId as number,
        category_l1_id: categoryL1 || null,
        comment: comment || null,
        counterparty_name: counterparty || null,
      },
      {
        onSuccess: () => navigate("/finances/transactions", { replace: true }),
      },
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Header */}
      <div className="mobile-header">
        <button
          className="btn btn-ghost btn-icon-sm"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </button>
        <h2 className="page-title" style={{ flex: 1 }}>
          Новая транзакция
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="stack fade-up"
        style={{ padding: "16px", gap: 14 }}
      >
        {/* Type toggle */}
        <div className="row gap-1">
          <button
            type="button"
            className={`btn btn-md ${txType === "expense" ? "btn-danger-solid" : "btn-secondary"}`}
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => setTxType("expense")}
          >
            Расход
          </button>
          <button
            type="button"
            className={`btn btn-md ${txType === "income" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => setTxType("income")}
          >
            Доход
          </button>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Сумма *</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input input-lg"
            style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
          />
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>

        {/* Account */}
        <div className="form-group">
          <label className="form-label">Счёт *</label>
          <select
            required
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value) || "")}
            className="input"
          >
            <option value="">Выберите счёт</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Категория</label>
          <select
            value={categoryL1}
            onChange={(e) => setCategoryL1(Number(e.target.value) || "")}
            className="input"
          >
            <option value="">Без категории</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Counterparty */}
        <input
          className="input"
          placeholder="Контрагент"
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
        />

        {/* Comment */}
        <textarea
          className="input"
          placeholder="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          style={{ resize: "none", height: "auto", paddingTop: 10, paddingBottom: 10 }}
        />

        {/* Error */}
        {createTx.isError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              fontSize: 13,
              color: "var(--danger)",
            }}
          >
            {(createTx.error as any)?.response?.data?.detail ??
              "Ошибка создания транзакции"}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createTx.isPending}
          className="btn btn-primary btn-xl"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {createTx.isPending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg
      width={18}
      height={18}
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
