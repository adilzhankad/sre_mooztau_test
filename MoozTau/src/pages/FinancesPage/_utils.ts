import { formatMoney } from "@/lib/order-helpers";
import type { FinTransaction, Order, UserRole } from "@/types";
import type { FinanceNamedValue, FinanceSummaryCard } from "./types";

export function calcDealerMetrics(orders: Order[], transactions: FinTransaction[]) {
  const turnover = orders.reduce((sum, order) => sum + order.final_amount, 0);
  const received = orders.reduce((sum, order) => sum + order.payment_received, 0);
  const outstanding = orders.reduce(
    (sum, order) => sum + order.payment_remaining,
    0,
  );
  const expense = transactions
    .filter((tx) => tx.transaction_type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    turnover,
    received,
    outstanding,
    expense,
    collection: turnover ? (received / turnover) * 100 : 0,
  };
}

export function avgIncome(transactions: FinTransaction[]) {
  const income = transactions.filter((tx) => tx.transaction_type === "income");
  return income.length
    ? income.reduce((sum, tx) => sum + tx.amount, 0) / income.length
    : 0;
}

export function filterTransactions(
  transactions: FinTransaction[],
  orders: Order[],
  role: UserRole | null,
  userId: number | null,
) {
  const orderIds = new Set(orders.map((order) => order.id));
  return transactions.filter((tx) =>
    role === "DEALER_MANAGER"
      ? tx.initiator_id === userId ||
        (tx.order_id != null && orderIds.has(tx.order_id))
      : tx.order_id != null && orderIds.has(tx.order_id),
  );
}

export function buildSummaryCards(params: {
  globalScope: boolean;
  summary?: { income: number; expense: number; balance: number };
  dealerMetrics: {
    turnover: number;
    received: number;
    outstanding: number;
    collection: number;
  };
  transactions: FinTransaction[];
}): FinanceSummaryCard[] {
  if (params.globalScope && params.summary) {
    return [
      {
        label: "Доход",
        value: formatMoney(params.summary.income),
        note: "Все поступления за период",
        color: "var(--success)",
      },
      {
        label: "Расход",
        value: formatMoney(params.summary.expense),
        note: "Все списания за период",
        color: "var(--danger)",
      },
      {
        label: "Баланс",
        value: formatMoney(params.summary.balance),
        note: "Чистый финансовый результат",
        color:
          params.summary.balance >= 0 ? "var(--success)" : "var(--danger)",
      },
      {
        label: "Средний входящий платёж",
        value: formatMoney(avgIncome(params.transactions)),
        note: "Средний размер поступления",
        color: "#0f766e",
      },
    ];
  }

  return [
    {
      label: "Оборот по заказам",
      value: formatMoney(params.dealerMetrics.turnover),
      note: "Сумма заказов в вашем контуре",
      color: "var(--success)",
    },
    {
      label: "Получено оплат",
      value: formatMoney(params.dealerMetrics.received),
      note: "Фактически зашедшие деньги",
      color: "#0f766e",
    },
    {
      label: "Остаток к получению",
      value: formatMoney(params.dealerMetrics.outstanding),
      note: "Неоплаченные суммы по заказам",
      color: params.dealerMetrics.outstanding
        ? "var(--warning)"
        : "var(--success)",
    },
    {
      label: "Собираемость",
      value: `${Math.round(params.dealerMetrics.collection)}%`,
      note: "Доля собранных денег от оборота",
      color: "#0f766e",
    },
  ];
}

export function groupTransactions(
  transactions: FinTransaction[],
  getName: (tx: FinTransaction) => string,
  getValue: (tx: FinTransaction) => number,
  getNote: (tx: FinTransaction) => string,
): FinanceNamedValue[] {
  const grouped = transactions.reduce<
    Record<string, { name: string; value: number; note: string }>
  >((acc, tx) => {
    const name = getName(tx);
    const current = acc[name] ?? { name, value: 0, note: getNote(tx) };
    current.value += getValue(tx);
    acc[name] = current;
    return acc;
  }, {});

  return Object.values(grouped);
}

export function groupOrders(
  orders: Order[],
  getName: (order: Order) => string,
  getValue: (order: Order) => number,
  getNote: (order: Order) => string,
): FinanceNamedValue[] {
  const grouped = orders.reduce<
    Record<string, { name: string; value: number; note: string }>
  >((acc, order) => {
    const name = getName(order);
    const current = acc[name] ?? { name, value: 0, note: getNote(order) };
    current.value += getValue(order);
    acc[name] = current;
    return acc;
  }, {});

  return Object.values(grouped);
}
