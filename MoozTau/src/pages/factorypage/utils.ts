import { INVENTORY_STATUS_LABELS } from "./constants";
import type { FactoryOrder, InventoryItem } from "@/types";
import type { InventoryFormState } from "./types";

export function createInitialInventoryForm(defaultFactory = ""): InventoryFormState {
  return {
    factory: defaultFactory,
    product_id: 0,
    model: "",
    color: "",
    quantity: 0,
    status: "in_stock",
  };
}

export function getInventoryStatusLabel(status: string) {
  return INVENTORY_STATUS_LABELS[status] ?? status;
}

export function getInventoryStatusTone(status: string) {
  if (status === "reserved") {
    return {
      background: "#FEF3C7",
      color: "#B45309",
    };
  }
  if (status === "shipped") {
    return {
      background: "#E0F2FE",
      color: "#0369A1",
    };
  }
  return {
    background: "#DCFCE7",
    color: "#15803D",
  };
}

export function buildInventorySummary(items: InventoryItem[]) {
  const totalPositions = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const reservedUnits = items
    .filter((item) => item.status === "reserved")
    .reduce((sum, item) => sum + item.quantity, 0);
  const shippedUnits = items
    .filter((item) => item.status === "shipped")
    .reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalPositions,
    totalUnits,
    reservedUnits,
    shippedUnits,
  };
}

export function filterOrdersBySearch(orders: FactoryOrder[], search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return orders;

  return orders.filter((order) => {
    const haystack = [
      order.order_number,
      order.client_name,
      order.client_region ?? "",
      order.factory,
      ...order.items.map((item) => item.model),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}
