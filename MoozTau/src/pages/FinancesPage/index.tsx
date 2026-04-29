import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAccounts,
  useReportByCategory,
  useReportByInitiator,
  useReportSummary,
  useTransactions,
} from "@/hooks/useFinance";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth-store";
import {
  canViewFinances,
  managerFilterForRole,
  orgFilterForRole,
} from "@/lib/permissions";
import type { TransactionType } from "@/types";
import {
  AccountsList,
  FinanceBlock,
  FinanceCard,
  FinanceRows,
  FinanceSkeleton,
  FinanceSummaryGrid,
  TransactionsList,
} from "./_components/FinanceBlocks";
import {
  IncomeExpenseChart,
  CategoryPieChart,
  BalanceTrendChart,
  InitiatorBarChart,
} from "./_components/FinanceCharts";
import { FinanceHero } from "./_components/FinanceHero";
import { financeDescription, financeTitle } from "./constants";
import {
  buildSummaryCards,
  calcDealerMetrics,
  filterTransactions,
  groupOrders,
  groupTransactions,
} from "./_utils";

export function FinancesPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const organizationId = useAuthStore((s) => s.organizationId);
  const fullName = useAuthStore((s) => s.fullName);
  const organizationName = useAuthStore((s) => s.organizationName);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(todayStr);
  const [breakdownType, setBreakdownType] = useState<TransactionType>("expense");

  const dealerScope = role === "DEALER_ADMIN" || role === "DEALER_MANAGER";
  const globalScope = role === "SUPER_ADMIN";

  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    date_from: dateFrom,
    date_to: dateTo,
    organization_id: orgFilterForRole(role, organizationId),
    manager_id: managerFilterForRole(role, userId),
    page_size: 200,
  });
  const { data: summary, isLoading: summaryLoading } = useReportSummary(
    globalScope ? { date_from: dateFrom, date_to: dateTo } : undefined,
  );
  const { data: breakdown } = useReportByCategory(
    globalScope
      ? {
          date_from: dateFrom,
          date_to: dateTo,
          transaction_type: breakdownType,
        }
      : undefined,
  );
  const { data: initiators } = useReportByInitiator(
    globalScope
      ? {
          date_from: dateFrom,
          date_to: dateTo,
          transaction_type: "income",
        }
      : undefined,
  );
  const { data: accounts } = useAccounts();
  const { data: transactionsData } = useTransactions({
    date_from: dateFrom,
    date_to: dateTo,
    page_size: 200,
  });

  if (!canViewFinances(role)) {
    return <FinanceBlock text="У этой роли нет доступа к финансам." pad={24} />;
  }

  const orders = ordersData?.results ?? [];
  const transactions = transactionsData?.results ?? [];
  const scopedTransactions = globalScope
    ? transactions
    : filterTransactions(transactions, orders, role, userId);
  const dealerMetrics = calcDealerMetrics(orders, scopedTransactions);

  const summaryCards = buildSummaryCards({
    globalScope,
    summary: summary
      ? {
          income: summary.income,
          expense: summary.expense,
          balance: summary.balance,
        }
      : undefined,
    dealerMetrics,
    transactions: scopedTransactions,
  });

  const breakdownRows = globalScope
    ? (breakdown ?? []).map((item) => ({
        name: item.category_name || "Без категории",
        value: Number(item.total ?? 0),
        note: "",
      }))
    : groupTransactions(
        scopedTransactions.filter(
          (tx) => tx.transaction_type === breakdownType,
        ),
        (tx) =>
          tx.category_l1_name ||
          (breakdownType === "income"
            ? "Оплаты клиентов"
            : "Прочие расходы"),
        (tx) => tx.amount,
        () => "",
      );

  const initiatorRows = globalScope
    ? (initiators ?? []).map((item) => ({
        name: item.initiator_name || `ID ${item.initiator_id ?? "—"}`,
        value: Number(item.income ?? item.net ?? 0),
        note: "",
      }))
    : role === "DEALER_MANAGER"
      ? [
          {
            name: fullName || "Ваш результат",
            value: dealerMetrics.turnover,
            note: `Получено оплат ${dealerMetrics.received}`,
          },
        ]
      : groupOrders(
          orders,
          (order) => order.manager_name || `Менеджер #${order.manager_id}`,
          (order) => order.final_amount,
          (order) => order.organization_name || "Без организации",
        );

  return (
    <div className="stack" style={{ padding: 16, gap: 16 }}>
      <FinanceHero
        title={financeTitle(role)}
        description={financeDescription(role, fullName, organizationName)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {summaryLoading || ordersLoading ? (
        <FinanceSkeleton />
      ) : !globalScope && orders.length === 0 ? (
        <FinanceBlock
          text="Нет финансовых данных за выбранный период по вашим заказам."
          pad={48}
        />
      ) : globalScope &&
        !summaryLoading &&
        (!summary || (summary.income === 0 && summary.expense === 0)) &&
        scopedTransactions.length === 0 ? (
        <FinanceBlock
          text="Транзакций за выбранный период нет. Добавьте первую через кнопку «+ Транзакция» или запустите seed-скрипт finance_service."
          pad={48}
        />
      ) : (
        <>
          <FinanceSummaryGrid cards={summaryCards} />

          <IncomeExpenseChart transactions={scopedTransactions} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <CategoryPieChart
              rows={breakdownRows}
              title={
                breakdownType === "expense"
                  ? "Структура расходов"
                  : "Структура доходов"
              }
              subtitle={
                breakdownType === "expense"
                  ? "Куда уходят деньги по категориям"
                  : "Откуда приходят деньги по категориям"
              }
            />
            <BalanceTrendChart transactions={scopedTransactions} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <FinanceCard
              title={dealerScope ? "Структура оплат" : "По категориям"}
              subtitle={
                dealerScope
                  ? "Откуда приходят деньги и какие статьи встречаются чаще всего"
                  : "Куда уходят и откуда приходят деньги"
              }
              action={
                <div className="row gap-1">
                  <button
                    className={`btn btn-sm ${breakdownType === "expense" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setBreakdownType("expense")}
                  >
                    Расходы
                  </button>
                  <button
                    className={`btn btn-sm ${breakdownType === "income" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setBreakdownType("income")}
                  >
                    Доходы
                  </button>
                </div>
              }
            >
              <FinanceRows rows={breakdownRows.slice(0, 6)} money />
            </FinanceCard>

            <FinanceCard
              title={role === "DEALER_MANAGER" ? "Ваш заработок" : "Кто сколько принёс"}
              subtitle={
                role === "DEALER_MANAGER"
                  ? "Ваш вклад по заказам и платежам"
                  : "Лидеры по обороту за выбранный период"
              }
            >
              <FinanceRows rows={initiatorRows.slice(0, 6)} money highlight />
            </FinanceCard>
          </div>

          <InitiatorBarChart rows={initiatorRows} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 0.9fr)",
              gap: 16,
            }}
          >
            <FinanceCard
              title="Последние транзакции"
              subtitle="Последние движения денег за выбранный период"
            >
              <TransactionsList rows={scopedTransactions.slice(0, 7)} />
            </FinanceCard>

            <FinanceCard
              title="Счета и ликвидность"
              subtitle="Где сейчас лежат деньги"
            >
              <AccountsList
                dealerScope={dealerScope}
                dealerReceived={dealerMetrics.received}
                accounts={accounts ?? []}
              />
            </FinanceCard>
          </div>

          <div className="row gap-3">
            <button
              className="btn btn-secondary btn-lg"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => navigate("/transactions")}
            >
              Все транзакции
            </button>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1, justifyContent: "center", gap: 5 }}
              onClick={() => navigate("/transactions/new")}
            >
              + Транзакция
            </button>
          </div>
        </>
      )}
    </div>
  );
}
