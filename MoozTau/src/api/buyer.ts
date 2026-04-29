import { authApi, ordersApi } from "@/lib/axios";
import type {
  LoginRequest,
  TokenResponse,
  BuyerOrder,
  BuyerStatusHistory,
  BuyerContract,
  ServiceRequest,
  ServiceRequestCreate,
  BuyerPayment,
  BuyerPaymentCreate,
} from "@/types";

// ── Auth ──

export async function buyerLogin(data: LoginRequest): Promise<TokenResponse> {
  const res = await authApi.post<TokenResponse>("/api/buyer/auth", data);
  return res.data;
}

export async function buyerRefreshToken(refreshToken: string): Promise<TokenResponse> {
  const res = await authApi.post<TokenResponse>("/api/buyer/auth/refresh", { refresh_token: refreshToken });
  return res.data;
}

export async function buyerResetPassword(phone: string, code: string, new_password: string): Promise<void> {
  await authApi.post("/api/buyer/auth/reset-password", { phone, code, new_password });
}

// ── Orders ──

export async function getBuyerOrders(): Promise<BuyerOrder[]> {
  const { data } = await ordersApi.get("/api/buyer/orders");
  return data;
}

export async function getBuyerOrder(id: number): Promise<BuyerOrder> {
  const { data } = await ordersApi.get(`/api/buyer/orders/${id}`);
  return data;
}

export async function getBuyerStatusHistory(orderId: number): Promise<BuyerStatusHistory[]> {
  const { data } = await ordersApi.get(`/api/buyer/orders/${orderId}/status-history`);
  return data;
}

export async function getBuyerContract(orderId: number): Promise<BuyerContract> {
  const { data } = await ordersApi.get(`/api/buyer/orders/${orderId}/contract`);
  return data;
}

export async function createBuyerPayment(orderId: number, payload: BuyerPaymentCreate): Promise<BuyerPayment> {
  const { data } = await ordersApi.post(`/api/buyer/orders/${orderId}/payments`, payload);
  return data;
}

export async function getBuyerServiceRequests(): Promise<ServiceRequest[]> {
  const { data } = await ordersApi.get("/api/buyer/service/requests");
  return data;
}

export async function createBuyerServiceRequest(payload: ServiceRequestCreate): Promise<ServiceRequest> {
  const { data } = await ordersApi.post("/api/buyer/service/requests", payload);
  return data;
}
