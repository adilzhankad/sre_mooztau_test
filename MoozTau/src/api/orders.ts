import { ordersApi } from "@/lib/axios";
import { getLangLocale } from "@/i18n";
import type {
  Order,
  OrderCreate,
  OrderUpdate,
  OrderStatusUpdate,
  OrderHistory,
  Payment,
  PaymentCreate,
  PaymentVerificationUpdate,
  OrderItem,
  OrderFilters,
  Paginated,
  StatusCount,
  PaymentMethodReference,
} from "@/types";

export async function getOrders(
  filters: OrderFilters = {},
): Promise<Paginated<Order>> {
  const params = Object.fromEntries(
    Object.entries(filters)
      .filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]),
  );
  const { data } = await ordersApi.get("/api/orders/", { params });
  return data;
}

export async function getOrder(id: number): Promise<Order> {
  const { data } = await ordersApi.get(`/api/orders/${id}`);
  return data;
}

export async function createOrder(order: OrderCreate): Promise<Order> {
  const { data } = await ordersApi.post("/api/orders/", order);
  return data;
}

export async function updateOrder(
  id: number,
  order: OrderUpdate,
): Promise<Order> {
  const { data } = await ordersApi.put(`/api/orders/${id}`, order);
  return data;
}

export async function updateOrderStatus(
  id: number,
  payload: OrderStatusUpdate,
): Promise<Order> {
  const { data } = await ordersApi.patch(`/api/orders/${id}/status`, payload);
  return data;
}

export async function getOrderHistory(
  id: number,
): Promise<OrderHistory[]> {
  const { data } = await ordersApi.get(`/api/orders/${id}/history`);
  return data;
}

export async function getOrderPayments(
  id: number,
): Promise<Payment[]> {
  const { data } = await ordersApi.get(`/api/orders/${id}/payments`);
  return data;
}

export async function addPayment(
  orderId: number,
  payment: PaymentCreate,
): Promise<Payment> {
  const { data } = await ordersApi.post(
    `/api/orders/${orderId}/payments`,
    payment,
  );
  return data;
}

export async function verifyPayment(
  orderId: number,
  paymentId: number,
  payload: PaymentVerificationUpdate,
): Promise<Payment> {
  const { data } = await ordersApi.patch(
    `/api/orders/${orderId}/payments/${paymentId}/verify`,
    payload,
  );
  return data;
}

export async function updateOrderItem(
  orderId: number,
  itemId: number,
  patch: { price_per_unit?: number; quantity?: number; color?: string },
): Promise<OrderItem> {
  const { data } = await ordersApi.patch(
    `/api/orders/${orderId}/items/${itemId}`,
    patch,
  );
  return data;
}

export async function generateContract(orderId: number): Promise<{ success: boolean; contract_id: number; file_path: string }> {
  const { data } = await ordersApi.post(`/contracts/orders/${orderId}/contract`);
  return data;
}

export async function downloadContract(orderId: number): Promise<void> {
  const { data, headers } = await ordersApi.get(
    `/contracts/orders/${orderId}/contract/download`,
    { responseType: "blob" },
  );
  const filename =
    headers["content-disposition"]?.match(/filename="?(.+?)"?$/)?.[1]
    ?? `contract_${orderId}.docx`;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function notifyClientContractReady(
  orderId: number,
): Promise<{ success: boolean }> {
  const { data } = await ordersApi.post(
    `/contracts/orders/${orderId}/contract/notify-client`,
  );
  return data;
}

export async function uploadContractScan(
  orderId: number,
  file: File,
): Promise<{
  success: boolean;
  contract_status: string;
  scanned_at: string;
  scan_url: string;
}> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await ordersApi.post(
    `/contracts/orders/${orderId}/contract/scan`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function downloadContractScan(orderId: number): Promise<void> {
  const { data, headers } = await ordersApi.get(
    `/contracts/orders/${orderId}/contract/scan/download`,
    { responseType: "blob" },
  );
  const filename =
    headers["content-disposition"]?.match(/filename="?(.+?)"?$/)?.[1]
    ?? `contract_scan_${orderId}`;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function sendContractSms(
  orderId: number,
): Promise<{ success: boolean; expires_at: string }> {
  const { data } = await ordersApi.post(`/contracts/orders/${orderId}/sign/sms`);
  return data;
}

export interface ContractSignatureReceipt {
  order_id: number;
  order_number: string;
  contract_number: string;
  signed_at: string;
  signed_by_user_id: number;
  client_name: string;
  client_iin_or_bin_last4: string;
  typed_full_name: string;
  ip: string;
  user_agent: string;
  accept_language: string;
  timezone: string;
  document_hash: string;
  document_hash_alg: string;
  consent_version: string;
  consent_text_hash: string;
  sms_code_hmac: string;
  receipt_hmac: string;
}

export interface VerifyContractSmsCodeInput {
  clientCode: string;
  consentVersion: string;
  consentAccepted: boolean;
  fullName: string;
  iinLast4: string;
  acceptLanguage?: string;
  timezone?: string;
}

export async function verifyContractSmsCode(
  orderId: number,
  input: VerifyContractSmsCodeInput,
): Promise<{
  success: boolean;
  message: string;
  receipt?: ContractSignatureReceipt;
}> {
  const { data } = await ordersApi.post(`/contracts/orders/${orderId}/sign/sms/verify`, {
    client_code: input.clientCode,
    consent_version: input.consentVersion,
    consent_accepted: input.consentAccepted,
    full_name: input.fullName,
    iin_last4: input.iinLast4,
    accept_language: input.acceptLanguage ?? getLangLocale(),
    timezone: input.timezone,
  });
  return data;
}

export async function getContractConsent(): Promise<{
  version: string;
  hash: string;
  text: string;
}> {
  const { data } = await ordersApi.get("/contracts/consent");
  return data;
}

export async function resendContractSms(
  orderId: number,
): Promise<{ success: boolean; expires_at: string }> {
  const { data } = await ordersApi.post(`/contracts/orders/${orderId}/sign/sms/resend`);
  return data;
}

export async function getOrderCounts(): Promise<StatusCount[]> {
  const { data } = await ordersApi.get("/api/orders/counts");
  return data;
}

// ── Reference data (справочники) ──

export async function getSalesChannels(): Promise<string[]> {
  const { data } = await ordersApi.get("/api/references/sales-channels");
  return data;
}

export async function getManufacturers(): Promise<string[]> {
  const { data } = await ordersApi.get("/api/references/manufacturers");
  return data;
}

export async function getPaymentMethods(): Promise<PaymentMethodReference[]> {
  const { data } = await ordersApi.get("/api/references/payment-methods");
  return data;
}
 
