import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import {
  useAnalyticsOverview,
  useAnalyticsFunnel,
  useAnalyticsFunnelStages,
  useAnalyticsQC,
  useAnalyticsDelivery,
  useAnalyticsChannels,
} from "@/hooks/useAnalytics";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_ORDERS } from "@/lib/mock-data";
import {
  canViewAnalytics,
  canViewFinancialAnalytics,
  managerFilterForRole,
  orgFilterForRole,
} from "@/lib/permissions";
import {
  AnalyticsBlock,
  AnalyticsCard,
  AnalyticsSkeleton,
  ListWithBars,
  MetricGrid,
  MiniColumns,
  PeopleList,
  ProductsList,
} from "./_components/AnalyticsBlocks";
import {
  RevenueByMonthChart,
  StatusPieChart,
  TopProductsBarChart,
  TopManagersBarChart,
  RegionsBarChart,
} from "./_components/AnalyticsCharts";
import { AnalyticsHero } from "./_components/AnalyticsHero";
import {
  FunnelBlock,
  FunnelStagesBlock,
  QCBlock,
  DeliveryBlock,
  ChannelsBlock,
} from "./_components/ControlLayerBlocks";
import { COMMERCIAL_ROLES, heroDescription, heroTitle } from "./constants";
import {
  buildMetricCards,
  buildOpsFocus,
  buildStatusRows,
  groupItems,
  groupMoney,
  sum,
} from "./_utils";

export function AnalyticsPage() {
  const role = useAuthStore((s) => s.role);
  const userId = useAuthStore((s) => s.userId);
  const organizationId = useAuthStore((s) => s.organizationId);
  const fullName = useAuthStore((s) => s.fullName);
  const organizationName = useAuthStore((s) => s.organizationName);

  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 90);
  const defaultStartStr = defaultStart.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(defaultStartStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const { data: ordersData, isLoading, error: ordersError } = useOrders({
    date_from: dateFrom,
    date_to: dateTo,
    organization_id: orgFilterForRole(role, organizationId),
    manager_id: managerFilterForRole(role, userId),
    page_size: 200,
  });

  const { data: overview, error: overviewError } = useAnalyticsOverview({
    date_from: dateFrom,
    date_to: dateTo,
  });

  const dateFilter = { date_from: dateFrom, date_to: dateTo };
  const canSeeFinancial = canViewFinancialAnalytics(role);
  const { data: funnelData } = useAnalyticsFunnel(dateFilter, canSeeFinancial);
  const { data: funnelStagesData } = useAnalyticsFunnelStages(dateFilter, canSeeFinancial);
  const { data: qcData } = useAnalyticsQC(dateFilter, canSeeFinancial);
  const { data: deliveryData } = useAnalyticsDelivery(dateFilter);
  const { data: channelsData } = useAnalyticsChannels(dateFilter, canSeeFinancial);

  if (!canViewAnalytics(role)) {
    return <AnalyticsBlock text="У этой роли нет доступа к аналитике." pad={24} />;
  }

  const liveOrders = ordersData?.results ?? [];
  const liveCount = overview?.total_orders ?? liveOrders.length;
  const apiFailed = !!ordersError || !!overviewError;
  const isDemo = liveOrders.length === 0 && liveCount === 0;
  const orders = isDemo ? MOCK_ORDERS : liveOrders;
  const commercial = !!role && COMMERCIAL_ROLES.includes(role);

  const ordersRevenue = sum(orders, "final_amount");
  const ordersPaid = sum(orders, "payment_received");
  const ordersOutstanding = sum(orders, "payment_remaining");
  const ordersCount = isDemo ? orders.length : overview?.total_orders ?? orders.length;
  const revenue = isDemo ? ordersRevenue : overview?.total_revenue ?? ordersRevenue;
  const avgCheck = isDemo
    ? (orders.length ? ordersRevenue / orders.length : 0)
    : overview?.avg_order_value ?? (orders.length ? ordersRevenue / orders.length : 0);
  const paid = ordersPaid;
  const outstanding = ordersOutstanding;
  const active = orders.filter(
    (order) => !["completed", "cancelled", "rejected", "returned"].includes(order.status),
  ).length;
  const completed = orders.filter((order) => order.status === "completed").length;
  const conversion = orders.length ? Math.round((completed / orders.length) * 100) : 0;

  const metricCards = buildMetricCards({
    commercial,
    role,
    orders,
    revenue,
    paid,
    outstanding,
    avgCheck,
    active,
    completed,
    conversion,
  });
  if (commercial && metricCards[0]) {
    metricCards[0] = { ...metricCards[0], note: `${ordersCount} заказов` };
  }

  const statusRows = buildStatusRows(orders);
  const topManagers = groupMoney(
    orders,
    (order) => order.manager_name || `Менеджер #${order.manager_id}`,
    (order) => order.final_amount,
    (order) => order.organization_name || "Без организации",
  );
  const topProducts = groupItems(orders);
  const topRegions = groupMoney(
    orders,
    (order) => order.client_region || "Не указан",
    (order) => order.final_amount,
    (order) => order.client_name,
  );
  const topClients = groupMoney(
    orders,
    (order) => order.client_name || "Клиент",
    (order) => order.final_amount,
    (order) => order.client_region || "Без региона",
  );
  const topChannels = groupMoney(
    orders,
    (order) => order.sales_channel || "Без канала",
    (order) => order.final_amount,
    (order) => order.organization_name || "Без организации",
  );
  const opsFocus = buildOpsFocus(orders);

  const errorMessage =
    (ordersError as { message?: string } | null)?.message ||
    (overviewError as { message?: string } | null)?.message ||
    null;

  return (
    <div className="stack" style={{ padding: 16, gap: 16 }}>
      <AnalyticsHero
        title={heroTitle(role)}
        description={heroDescription(role, fullName, organizationName)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {apiFailed && (
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--danger)",
                fontSize: 13,
              }}
            >
              Не удалось получить аналитику с сервера
              {errorMessage ? `: ${errorMessage}` : "."} Показаны демо-данные.
            </div>
          )}
          {isDemo && !apiFailed && (
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: "rgba(157,207,0,0.1)",
                border: "1px solid rgba(157,207,0,0.3)",
                fontSize: 13,
              }}
            >
              Демо-режим: за выбранный период реальных заказов нет. Показаны
              примерные данные для демонстрации разделов. Добавьте заказы или
              запустите seed orders_service (<code>python -m scripts.seed_orders</code>),
              чтобы увидеть настоящие цифры.
            </div>
          )}
          {canSeeFinancial && <MetricGrid cards={metricCards} />}

          {canSeeFinancial && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              <FunnelBlock data={funnelData} />
              <QCBlock data={qcData} />
            </div>
          )}

          {canSeeFinancial && funnelStagesData && (
            <FunnelStagesBlock data={funnelStagesData} />
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: canSeeFinancial
                ? "repeat(auto-fit, minmax(300px, 1fr))"
                : "minmax(0, 1fr)",
              gap: 16,
            }}
          >
            <DeliveryBlock data={deliveryData} />
            {canSeeFinancial && <ChannelsBlock channels={channelsData?.channels} />}
          </div>

          {canSeeFinancial && <RevenueByMonthChart orders={orders} />}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <StatusPieChart orders={orders} />

            <AnalyticsCard
              title={commercial ? "Статусы заказов" : "Статусы в работе"}
              subtitle="Где сейчас сосредоточен основной объём"
            >
              <ListWithBars rows={statusRows} money={false} />
            </AnalyticsCard>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <AnalyticsCard
              title={commercial ? "Точки роста" : "Карта нагрузки"}
              subtitle={
                commercial
                  ? "Регионы, клиенты и каналы с наибольшей активностью"
                  : "Регионы и заказы, которые грузят процесс сильнее всего"
              }
            >
              <MiniColumns
                leftTitle={commercial && role === "SUPER_ADMIN" ? "Каналы" : "Регионы"}
                leftRows={commercial && role === "SUPER_ADMIN" ? topChannels.slice(0, 5) : topRegions.slice(0, 5)}
                rightTitle={commercial ? "Клиенты" : "Заказы"}
                rightRows={commercial ? topClients.slice(0, 5) : opsFocus.slice(0, 5)}
                money={commercial}
              />
            </AnalyticsCard>

            {commercial && <RegionsBarChart rows={topRegions} />}
          </div>

          {commercial ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                <TopManagersBarChart rows={topManagers.sort((a, b) => b.value - a.value)} />
                <TopProductsBarChart rows={topProducts} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
                  gap: 16,
                }}
              >
                <AnalyticsCard
                  title={role === "DEALER_MANAGER" ? "Ваш заработок" : "Кто сколько заработал"}
                  subtitle={
                    role === "DEALER_MANAGER"
                      ? "Только ваши сделки, оплаты и результат"
                      : "Менеджеры и команды по выручке"
                  }
                >
                  <PeopleList
                    rows={
                      role === "DEALER_MANAGER"
                        ? topManagers.slice(0, 1).sort((a, b) => b.value - a.value)
                        : topManagers.slice(0, 6).sort((a, b) => b.value - a.value)
                    }
                  />
                </AnalyticsCard>

                <AnalyticsCard
                  title="Топ товаров"
                  subtitle="Какие модели двигают выручку сильнее остальных"
                >
                  <ProductsList rows={topProducts.slice(0, 6)} />
                </AnalyticsCard>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
