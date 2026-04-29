import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as analyticsApi from "@/api/analytics";
import type { DateFilter, OrderAnalyticsFilter } from "@/api/analytics";

export function useAnalyticsOverview(filters?: DateFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "overview", filters],
    queryFn: () => analyticsApi.getOverview(filters),
  });
}

export function useRevenueAnalytics(params?: { period?: string; year?: number }) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "revenue", params],
    queryFn: () => analyticsApi.getRevenueAnalytics(params),
  });
}

export function useOrderAnalytics(filters?: OrderAnalyticsFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "orders", filters],
    queryFn: () => analyticsApi.getOrderAnalytics(filters),
  });
}

export function useDealerAnalytics(filters?: DateFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "dealers", filters],
    queryFn: () => analyticsApi.getDealerAnalytics(filters),
  });
}

export function useRegionAnalytics(filters?: DateFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "regions", filters],
    queryFn: () => analyticsApi.getRegionAnalytics(filters),
  });
}

export function useProductAnalytics(filters?: DateFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "products", filters],
    queryFn: () => analyticsApi.getProductAnalytics(filters),
  });
}

export function usePaymentAnalytics(filters?: DateFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "payments", filters],
    queryFn: () => analyticsApi.getPaymentAnalytics(filters),
  });
}

export function useAnalyticsFunnel(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "funnel", filters],
    queryFn: () => analyticsApi.getFunnelAnalytics(filters),
    enabled,
  });
}

export function useAnalyticsFunnelStages(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "funnel-stages", filters],
    queryFn: () => analyticsApi.getFunnelStages(filters),
    enabled,
  });
}

export function useAnalyticsQC(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "qc", filters],
    queryFn: () => analyticsApi.getQCAnalytics(filters),
    enabled,
  });
}

export function useAnalyticsDelivery(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "delivery", filters],
    queryFn: () => analyticsApi.getDeliveryAnalytics(filters),
    enabled,
  });
}

export function useAnalyticsChannels(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "channels", filters],
    queryFn: () => analyticsApi.getChannelsAnalytics(filters),
    enabled,
  });
}

export function useAnalyticsRevenueBreakdown(filters?: DateFilter, enabled: boolean = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "revenue-breakdown", filters],
    queryFn: () => analyticsApi.getRevenueBreakdown(filters),
    enabled,
  });
}
