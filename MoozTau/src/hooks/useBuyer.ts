import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as buyerApi from "@/api/buyer";
import type { BuyerPaymentCreate, ServiceRequestCreate } from "@/types";

export function useBuyerOrders() {
  return useQuery({
    queryKey: [QUERY_KEYS.buyer, "orders"],
    queryFn: buyerApi.getBuyerOrders,
  });
}

export function useBuyerOrder(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.buyer, "orders", id],
    queryFn: () => buyerApi.getBuyerOrder(id!),
    enabled: id != null,
  });
}

export function useBuyerStatusHistory(orderId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.buyer, "status-history", orderId],
    queryFn: () => buyerApi.getBuyerStatusHistory(orderId!),
    enabled: orderId != null,
  });
}

export function useBuyerContract(orderId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.buyer, "contract", orderId],
    queryFn: async () => {
      try {
        return await buyerApi.getBuyerContract(orderId!);
      } catch (err: any) {
        // Договора может не быть → не считаем это ошибкой
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: orderId != null,
    retry: false,
  });
}

export function useBuyerServiceRequests() {
  return useQuery({
    queryKey: [QUERY_KEYS.buyer, "service-requests"],
    queryFn: buyerApi.getBuyerServiceRequests,
  });
}

export function useCreateBuyerServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceRequestCreate) => buyerApi.createBuyerServiceRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.buyer, "service-requests"] });
    },
  });
}

export function useCreateBuyerPayment(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BuyerPaymentCreate) => buyerApi.createBuyerPayment(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.buyer, "orders"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.buyer, "orders", orderId] });
    },
  });
}
