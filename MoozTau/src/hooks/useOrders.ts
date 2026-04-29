import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as ordersApi from "@/api/orders";
import type {
  OrderCreate,
  OrderUpdate,
  OrderStatusUpdate,
  PaymentCreate,
  PaymentVerificationUpdate,
  OrderFilters,
} from "@/types";

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.orders, filters],
    queryFn: () => ordersApi.getOrders(filters),
  });
}

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.orders, id],
    queryFn: () => ordersApi.getOrder(id!),
    enabled: id != null,
  });
}

export function useOrderHistory(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.orders, id, "history"],
    queryFn: () => ordersApi.getOrderHistory(id!),
    enabled: id != null,
  });
}

export function useOrderPayments(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.orders, id, "payments"],
    queryFn: () => ordersApi.getOrderPayments(id!),
    enabled: id != null,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) => ordersApi.createOrder(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] }),
  });
}

export function useUpdateOrder(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderUpdate) => ordersApi.updateOrder(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] }),
  });
}

export function useUpdateOrderStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderStatusUpdate) =>
      ordersApi.updateOrderStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] }),
  });
}

export function useAddPayment(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentCreate) => ordersApi.addPayment(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders, orderId] });
      qc.invalidateQueries({
        queryKey: [QUERY_KEYS.orders, orderId, "payments"],
      });
    },
  });
}

export function useVerifyPayment(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: number; payload: PaymentVerificationUpdate }) =>
      ordersApi.verifyPayment(orderId, paymentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders, orderId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders, orderId, "payments"] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.buyer, "orders"] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.buyer, "orders", orderId] });
    },
  });
}

export function useUpdateOrderItem(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, patch }: { itemId: number; patch: { price_per_unit?: number; quantity?: number; color?: string } }) =>
      ordersApi.updateOrderItem(orderId, itemId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders, orderId] });
    },
  });
}

export function useOrderCounts() {
  return useQuery({
    queryKey: [QUERY_KEYS.orderCounts],
    queryFn: ordersApi.getOrderCounts,
  });
}

// ── Reference data hooks ──

export function useSalesChannels() {
  return useQuery({
    queryKey: ["sales-channels"],
    queryFn: ordersApi.getSalesChannels,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManufacturers() {
  return useQuery({
    queryKey: ["manufacturers"],
    queryFn: ordersApi.getManufacturers,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: ordersApi.getPaymentMethods,
    staleTime: 5 * 60 * 1000,
  });
}
