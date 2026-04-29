import { ordersApi } from "@/lib/axios";
import type {
  QCQueueItem,
  QCChecklist,
  QCChecklistCreate,
  QCRejectPayload,
  StatusActionResponse,
  QCRejectResponse,
} from "@/types";

export async function getQCQueue(): Promise<QCQueueItem[]> {
  const { data } = await ordersApi.get("/api/factory/orders/qc-queue");
  return data;
}

export async function getQCChecklist(orderId: number): Promise<QCChecklist> {
  const { data } = await ordersApi.get(`/api/factory/orders/${orderId}/qc`);
  return data;
}

export async function saveQCChecklist(orderId: number, payload: QCChecklistCreate): Promise<QCChecklist> {
  const { data } = await ordersApi.post(`/api/factory/orders/${orderId}/qc`, payload);
  return data;
}

export async function passQC(orderId: number): Promise<StatusActionResponse> {
  const { data } = await ordersApi.post(`/api/factory/orders/${orderId}/qc/pass`);
  return data;
}

export async function rejectQC(orderId: number, payload: QCRejectPayload): Promise<QCRejectResponse> {
  const { data } = await ordersApi.post(`/api/factory/orders/${orderId}/qc/reject`, payload);
  return data;
}

export async function getQCHistory(orderId: number): Promise<QCChecklist[]> {
  const { data } = await ordersApi.get(`/api/factory/orders/${orderId}/qc/history`);
  return data;
}
