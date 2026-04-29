import { useMemo, useState } from "react";
import { formatDate, formatDateTime, formatMoney } from "@/lib/order-helpers";
import { usePaymentMethods } from "@/hooks/useOrders";
import type { Payment, PaymentVerificationStatus } from "@/types";

const CATEGORIES = ["Предоплата", "Полная оплата", "Доплата", "Возврат"];

const BANK_COLORS: Record<string, string> = {
  Kaspi: "#FF4B2B",
  Halyk: "#16A34A",
  БЦК: "#2563EB",
  Bereke: "#F59E0B",
  Forte: "#8B5CF6",
  Наличными: "#6B7280",
};

interface Props {
  payments: Payment[];
  totalAmount: number;
  paymentReceived: number;
  canAddPayment: boolean;
  isAdding: boolean;
  isVerifying?: boolean;
  onAddPayment: (amount: number, method: string, note?: string, category?: string) => void;
  onVerifyPayment?: (paymentId: number, status: PaymentVerificationStatus) => void;
}

export function OrderPaymentsCard({
  payments,
  totalAmount,
  paymentReceived,
  canAddPayment,
  isAdding,
  isVerifying = false,
  onAddPayment,
  onVerifyPayment,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [category, setCategory] = useState("Предоплата");
  const [note, setNote] = useState("");

  const { data: paymentMethods = [] } = usePaymentMethods();
  const banks = useMemo(() => [...new Set(paymentMethods.map((m) => m.bank))], [paymentMethods]);
  const peopleByBank = useMemo(
    () => (selectedBank ? paymentMethods.filter((m) => m.bank === selectedBank) : []),
    [selectedBank, paymentMethods],
  );

  const pct = totalAmount > 0 ? (paymentReceived / totalAmount) * 100 : 0;
  const remaining = Math.max(totalAmount - paymentReceived, 0);

  function handleSubmit() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !selectedBank || !selectedPerson) return;
    onAddPayment(parsed, `${selectedBank} - ${selectedPerson}`, note || undefined, category);
    setShowForm(false);
    setAmount("");
    setSelectedBank(null);
    setSelectedPerson(null);
    setCategory("Предоплата");
    setNote("");
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Оплаты</span>
        {canAddPayment && !showForm && (
          <button className="btn btn-primary btn-xs" onClick={() => setShowForm(true)}>+ Добавить</button>
        )}
      </div>

      <div className="row-between text-xs text-secondary" style={{ marginBottom: 14 }}>
        <span>Оплачено: <strong className="text-default tabnum">{pct.toFixed(1)}%</strong> ({formatMoney(paymentReceived)})</span>
        <span>Остаток: <strong className="text-default tabnum">{formatMoney(remaining)}</strong></span>
      </div>

      {showForm && (
        <div className="card card-sm" style={{ marginBottom: 14, background: "var(--bg-base)", border: "1px solid var(--border)" }}>
          <input
            className="input"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            style={{ marginBottom: 10 }}
          />

          <p className="form-label" style={{ marginBottom: 6 }}>Банк</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {banks.map((bank) => {
              const color = BANK_COLORS[bank] || "#6b7280";
              return (
                <button
                  key={bank}
                  onClick={() => {
                    setSelectedBank(bank);
                    setSelectedPerson(null);
                  }}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: selectedBank === bank ? `2px solid ${color}` : "1px solid var(--border)",
                    background: selectedBank === bank ? `${color}15` : "var(--bg-surface)",
                    color,
                  }}
                >
                  {bank}
                </button>
              );
            })}
          </div>

          {selectedBank && (
            <>
              <p className="form-label" style={{ marginBottom: 6 }}>Получатель</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {peopleByBank.map((person) => (
                  <button
                    key={person.person}
                    onClick={() => setSelectedPerson(person.person)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      cursor: "pointer",
                      border: selectedPerson === person.person ? "2px solid var(--text-default)" : "1px solid var(--border)",
                      background: selectedPerson === person.person ? "var(--text-default)" : "var(--bg-surface)",
                      color: selectedPerson === person.person ? "#fff" : "var(--text-default)",
                      fontWeight: selectedPerson === person.person ? 600 : 400,
                    }}
                  >
                    {person.person}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="form-label" style={{ marginBottom: 6 }}>Категория</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  cursor: "pointer",
                  border: category === item ? "2px solid var(--success)" : "1px solid var(--border)",
                  background: category === item ? "var(--success-light)" : "var(--bg-surface)",
                  color: category === item ? "var(--success-fg)" : "var(--text-secondary)",
                  fontWeight: category === item ? 600 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <input
            className="input"
            placeholder="Комментарий (необязательно)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <div className="row gap-2">
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Отмена</button>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSubmit} disabled={isAdding}>
              {isAdding ? "..." : "Добавить"}
            </button>
          </div>
        </div>
      )}

      {payments.length > 0 ? (
        <div className="stack gap-2">
          {payments.map((payment) => {
            const tone = verificationTone(payment.verification_status);
            const { bank, recipient } = parseMethod(payment.payment_method);
            const bankColor = bank ? BANK_COLORS[bank] ?? "#6b7280" : "#6b7280";
            const sourceLabel = payment.payment_source === "buyer" ? "Покупатель" : "Менеджер";
            const createdDT = payment.created_at ? formatDateTime(payment.created_at) : null;
            return (
              <div
                key={payment.id}
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                  border: "1px solid var(--border-light)",
                  borderLeft: `3px solid ${tone.line}`,
                  background: "var(--bg-surface)",
                }}
              >
                {/* Сумма + статус */}
                <div className="row-between" style={{ alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <div>
                    <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Сумма</div>
                    <div className="text-lg font-bold tabnum text-default">{formatMoney(payment.amount)}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: tone.bg,
                      color: tone.fg,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tone.label}
                  </span>
                </div>

                {/* Когда + Куда */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    padding: "8px 10px",
                    background: "var(--bg-subtle)",
                    borderRadius: 10,
                    marginBottom: payment.category || payment.note ? 8 : 0,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Когда</div>
                    <div className="text-sm font-semibold text-default" style={{ lineHeight: 1.2 }}>
                      {formatDate(payment.payment_date)}
                    </div>
                    {createdDT && createdDT !== formatDate(payment.payment_date) && (
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        добавлено {createdDT}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="text-xs text-muted" style={{ marginBottom: 2 }}>Куда</div>
                    {bank ? (
                      <>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: `${bankColor}15`,
                            color: bankColor,
                            border: `1px solid ${bankColor}40`,
                          }}
                        >
                          {bank}
                        </span>
                        {recipient && (
                          <div className="text-xs text-secondary" style={{ marginTop: 4, wordBreak: "break-word" }}>
                            {recipient}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-default" style={{ wordBreak: "break-word" }}>
                        {payment.payment_method || "—"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Категория + Комментарий */}
                {(payment.category || payment.note) && (
                  <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 6 }}>
                    {payment.category && (
                      <span className="badge badge-success" style={{ fontSize: 10 }}>
                        {payment.category}
                      </span>
                    )}
                    {payment.note && (
                      <span className="text-xs text-secondary" style={{ flex: 1, minWidth: 0 }}>
                        💬 {payment.note}
                      </span>
                    )}
                  </div>
                )}

                {/* Мета: кто добавил / кто проверил */}
                <div className="row gap-3" style={{ flexWrap: "wrap", marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>Добавил: <strong className="text-default">{sourceLabel}</strong></span>
                  {payment.verified_by_name && (
                    <span>Проверил: <strong className="text-default">{payment.verified_by_name}</strong></span>
                  )}
                </div>

                {payment.verification_comment && (
                  <div className="text-xs text-secondary" style={{ marginTop: 6, fontStyle: "italic" }}>
                    {payment.verification_comment}
                  </div>
                )}

                {canAddPayment && onVerifyPayment && payment.payment_source === "buyer" && (payment.verification_status ?? "confirmed") !== "confirmed" && (
                  <div className="row gap-2" style={{ marginTop: 10 }}>
                    <button
                      className="btn btn-primary btn-xs"
                      disabled={isVerifying}
                      onClick={() => onVerifyPayment(payment.id, "confirmed")}
                    >
                      Подтвердить
                    </button>
                    <button
                      className="btn btn-secondary btn-xs"
                      disabled={isVerifying}
                      onClick={() => onVerifyPayment(payment.id, "risk")}
                    >
                      Пометить риском
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted" style={{ textAlign: "center", padding: "12px 0" }}>Нет оплат</p>
      )}
    </div>
  );
}

function parseMethod(method: string | null | undefined): { bank: string | null; recipient: string | null } {
  if (!method) return { bank: null, recipient: null };
  const idx = method.indexOf(" - ");
  if (idx === -1) return { bank: method.trim() || null, recipient: null };
  return {
    bank: method.slice(0, idx).trim() || null,
    recipient: method.slice(idx + 3).trim() || null,
  };
}

function verificationTone(status?: PaymentVerificationStatus) {
  switch (status ?? "confirmed") {
    case "review_required":
      return { label: "Требует проверки", bg: "#FEF3C7", fg: "#A16207", line: "#EAB308" };
    case "risk":
      return { label: "Ошибка / риск", bg: "#FEE2E2", fg: "#B91C1C", line: "#EF4444" };
    default:
      return { label: "Оплата подтверждена", bg: "#DCFCE7", fg: "#15803D", line: "#22C55E" };
  }
}
