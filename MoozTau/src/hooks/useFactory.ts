import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as factoryApi from "@/api/factory";
import type { InventoryCreate, InventoryUpdate, OrderStatusUpdate } from "@/types";

export function useFactoryOrders(filters?: { status_filter?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.factory, "orders", filters],
    queryFn: () => factoryApi.getFactoryOrders(filters),
  });
}

export function useFactoryOrder(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.factory, "orders", id],
    queryFn: () => factoryApi.getFactoryOrder(id!),
    enabled: id != null,
  });
}

export function useUpdateFactoryOrderStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderStatusUpdate) => factoryApi.updateFactoryOrderStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.factory] }),
  });
}

export function useFactoryDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.factory, "dashboard"],
    queryFn: factoryApi.getFactoryDashboard,
  });
}

export function useInventory(filters?: {
  model?: string;
  factory?: string;
  status_filter?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.inventory, filters],
    queryFn: () => factoryApi.getInventory(filters),
  });
}

export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryCreate) => factoryApi.createInventory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.inventory] }),
  });
}

export function useUpdateInventory(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InventoryUpdate) => factoryApi.updateInventory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.inventory] }),
  });
}

export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => factoryApi.deleteInventory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.inventory] }),
  });
}
