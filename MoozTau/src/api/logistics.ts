import { ordersApi } from "@/lib/axios";
import type {
  LogisticsOrder,
  LogisticsDashboard,
  AssignCourierPayload,
  DispatchPayload,
  DeliverPayload,
  AssignCourierResponse,
  StatusActionResponse,
  StartMatchingPayload,
  StartMatchingResponse,
  SelectMasterPayload,
  SelectMasterResponse,
} from "@/types";

export async function getLogisticsOrders(statusFilter?: string): Promise<LogisticsOrder[]> {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const { data } = await ordersApi.get("/api/logistics/orders", { params });
  return data;
}

export async function getLogisticsDashboard(): Promise<LogisticsDashboard> {
  const { data } = await ordersApi.get("/api/logistics/dashboard");
  return data;
}

export async function assignCourier(orderId: number, payload: AssignCourierPayload): Promise<AssignCourierResponse> {
  const { data } = await ordersApi.post(`/api/logistics/orders/${orderId}/assign-courier`, payload);
  return data;
}

export async function dispatchOrder(orderId: number, payload: DispatchPayload): Promise<StatusActionResponse> {
  const { data } = await ordersApi.post(`/api/logistics/orders/${orderId}/dispatch`, payload);
  return data;
}

export async function deliverOrder(orderId: number, payload: DeliverPayload): Promise<StatusActionResponse> {
  const { data } = await ordersApi.post(`/api/logistics/orders/${orderId}/deliver`, payload);
  return data;
}

export async function startMatching(orderId: number, payload: StartMatchingPayload = {}): Promise<StartMatchingResponse> {
  const { data } = await ordersApi.post(`/api/logistics/orders/${orderId}/start-matching`, payload);
  return data;
}

export async function selectMaster(orderId: number, payload: SelectMasterPayload): Promise<SelectMasterResponse> {
  const { data } = await ordersApi.post(`/api/logistics/orders/${orderId}/select-master`, payload);
  return data;
}
