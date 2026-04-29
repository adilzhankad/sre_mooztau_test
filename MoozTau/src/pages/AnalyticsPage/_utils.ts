import { ORDER_STATUS_LABELS, formatMoney } from "@/lib/order-helpers";
import type { Order } from "@/types";
import type {
  AnalyticsListRow,
  AnalyticsMetricCard,
  AnalyticsNamedValue,
  AnalyticsProductRow,
} from "./types";

export function sum(
  orders: Order[],
  key: "final_amount" | "payment_received" | "payment_remaining",
) {
  return orders.reduce((total, order) => total + order[key], 0);
}

export function buildMetricCards(params: {
  commercial: boolean;
  role: string | null;
  orders: Order[];
  revenue: number;
  paid: number;
  outstanding: number;
  avgCheck: number;
  active: number;
  completed: number;
  conversion: number;
}): AnalyticsMetricCard[] {
  const {
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
  } = params;

  if (commercial) {
    return [
      {
        label: "Выручка",
        value: formatMoney(revenue),
        note: `${orders.length} заказов`,
        color: "#1d5f7a",
      },
      {
        label: "Получено оплат",
        value: formatMoney(paid),
        note: revenue
          ? `${Math.round((paid / revenue) * 100)}% от оборота`
          : "Пока без поступлений",
        color: "var(--success)",
      },
      {
        label: "Дебиторка",
        value: formatMoney(outstanding),
        note: outstanding ? "Нужно дожать оплаты" : "Просрочки не видно",
        color: outstanding ? "var(--danger)" : "var(--success)",
      },
      {
        label: role === "DEALER_MANAGER" ? "Ваш средний чек" : "Средний чек",
        value: formatMoney(avgCheck),
        note: `${active} активных заказов`,
        color: "var(--text-default)",
      },
    ];
  }

  return [
    {
      label: "В производстве / работе",
      value: String(
        orders.filter((order) =>
          ["in_progress", "qc_review"].includes(order.status),
        ).length,
      ),
      note: "Текущая загрузка",
      color: "#1d5f7a",
    },
    {
      label: "Готово к отгрузке",
      value: String(
        orders.filter((order) => order.status === "waiting_courier").length,
      ),
      note: "Можно передавать дальше",
      color: "var(--success)",
    },
    {
      label: "Отклонено / на доработке",
      value: String(
        orders.filter((order) => order.status === "qc_rejected").length,
      ),
      note: "Риск узкого места",
      color: "var(--danger)",
    },
    {
      label: "Процент завершения",
      value: `${conversion}%`,
      note: `${completed} завершённых`,
      color: "var(--warning)",
    },
  ];
}

export function buildStatusRows(orders: Order[]): AnalyticsListRow[] {
  const grouped = orders.reduce<Record<string, number>>((acc, order) => {
    const name = ORDER_STATUS_LABELS[order.status] ?? order.status;
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([label, value]) => ({
    label,
    value,
    sub: "",
  }));
}

export function groupMoney(
  orders: Order[],
  getName: (order: Order) => string,
  getValue: (order: Order) => number,
  getNote: (order: Order) => string,
): AnalyticsNamedValue[] {
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

export function groupItems(orders: Order[]): AnalyticsProductRow[] {
  const grouped = orders.reduce<
    Record<string, { name: string; quantity: number; value: number }>
  >((acc, order) => {
    order.items.forEach((item) => {
      const name = item.model;
      const current = acc[name] ?? { name, quantity: 0, value: 0 };
      current.quantity += item.quantity;
      current.value += item.total_price;
      acc[name] = current;
    });
    return acc;
  }, {});

  return Object.values(grouped);
}

export function buildOpsFocus(orders: Order[]): AnalyticsNamedValue[] {
  return orders.slice(0, 6).map((order) => ({
    name: order.order_number,
    value: order.final_amount,
    note: `${order.client_name} · ${ORDER_STATUS_LABELS[order.status] ?? order.status}`,
  }));
}
