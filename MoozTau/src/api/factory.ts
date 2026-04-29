import { ordersApi } from "@/lib/axios";
import type {
  FactoryOrder,
  FactoryDashboard,
  InventoryItem,
  InventoryCreate,
  InventoryUpdate,
  OrderStatusUpdate,
} from "@/types";

export async function getFactoryOrders(filters?: {
  status_filter?: string;
}): Promise<FactoryOrder[]> {
  const params = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value != null && value !== ""),
  );
  const { data } = await ordersApi.get("/api/factory/orders", { params });
  return data;
}

export async function getFactoryOrder(id: number): Promise<FactoryOrder> {
  const { data } = await ordersApi.get(`/api/factory/orders/${id}`);
  return data;
}

export async function updateFactoryOrderStatus(
  id: number,
  payload: OrderStatusUpdate,
): Promise<FactoryOrder> {
  const { data } = await ordersApi.patch(`/api/factory/orders/${id}/status`, payload);
  return data;
}

export async function getFactoryDashboard(): Promise<FactoryDashboard> {
  const { data } = await ordersApi.get("/api/factory/dashboard");
  return data;
}

export async function getInventory(filters?: {
  model?: string;
  factory?: string;
  status_filter?: string;
}): Promise<InventoryItem[]> {
  const params = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value != null && value !== ""),
  );
  const { data } = await ordersApi.get("/api/factory/inventory", { params });
  return data;
}

export async function createInventory(item: InventoryCreate): Promise<InventoryItem> {
  const { data } = await ordersApi.post("/api/factory/inventory", item);
  return data;
}

export async function updateInventory(
  id: number,
  item: InventoryUpdate,
): Promise<InventoryItem> {
  const { data } = await ordersApi.put(`/api/factory/inventory/${id}`, item);
  return data;
}

export async function deleteInventory(id: number): Promise<void> {
  await ordersApi.delete(`/api/factory/inventory/${id}`);
}
