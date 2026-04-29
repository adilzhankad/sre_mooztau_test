import { ordersApi } from "@/lib/axios";
import type {
  AnalyticsOverview,
  RevenueAnalytics,
  OrderAnalytics,
  DealerAnalytics,
  RegionAnalytics,
  ProductAnalytics,
  PaymentAnalytics,
  FunnelCanonical,
  FunnelStages,
  QCAnalytics,
  DeliveryAnalytics,
  ChannelsAnalytics,
  RevenueBreakdown,
} from "@/types";

export interface DateFilter {
  date_from?: string;
  date_to?: string;
}

export interface OrderAnalyticsFilter extends DateFilter {
  sales_channel?: string | string[];
  organization_id?: number;
  manager_id?: number;
}

function cleanParams(filters?: Record<string, any>) {
  if (!filters) return undefined;
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v]),
  );
}

export async function getOverview(filters?: DateFilter): Promise<AnalyticsOverview> {
  const { data } = await ordersApi.get("/api/analytics/overview", { params: cleanParams(filters) });
  return data;
}

export async function getRevenueAnalytics(params?: { period?: string; year?: number }): Promise<RevenueAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/revenue", { params });
  return data;
}

export async function getOrderAnalytics(filters?: OrderAnalyticsFilter): Promise<OrderAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/orders", { params: cleanParams(filters) });
  return data;
}

export async function getDealerAnalytics(filters?: DateFilter): Promise<DealerAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/dealers", { params: cleanParams(filters) });
  return data;
}

export async function getRegionAnalytics(filters?: DateFilter): Promise<RegionAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/regions", { params: cleanParams(filters) });
  return data;
}

export async function getProductAnalytics(filters?: DateFilter & { limit?: number }): Promise<ProductAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/products", { params: cleanParams(filters) });
  return data;
}

export async function getPaymentAnalytics(filters?: DateFilter): Promise<PaymentAnalytics[]> {
  const { data } = await ordersApi.get("/api/analytics/payments", { params: cleanParams(filters) });
  return data.by_method ?? [];
}

export async function getFunnelAnalytics(filters?: DateFilter): Promise<FunnelCanonical> {
  const { data } = await ordersApi.get("/api/analytics/funnel/canonical", { params: cleanParams(filters) });
  return data;
}

export async function getFunnelStages(filters?: DateFilter): Promise<FunnelStages> {
  const { data } = await ordersApi.get("/api/analytics/funnel", { params: cleanParams(filters) });
  return data;
}

export async function getQCAnalytics(filters?: DateFilter): Promise<QCAnalytics> {
  const { data } = await ordersApi.get("/api/analytics/qc", { params: cleanParams(filters) });
  return data;
}

export async function getDeliveryAnalytics(filters?: DateFilter): Promise<DeliveryAnalytics> {
  const { data } = await ordersApi.get("/api/analytics/delivery", { params: cleanParams(filters) });
  return data;
}

export async function getChannelsAnalytics(filters?: DateFilter): Promise<ChannelsAnalytics> {
  const { data } = await ordersApi.get("/api/analytics/channels", { params: cleanParams(filters) });
  return data;
}

export async function getRevenueBreakdown(filters?: DateFilter): Promise<RevenueBreakdown> {
  const { data } = await ordersApi.get("/api/analytics/revenue/breakdown", { params: cleanParams(filters) });
  return data;
}