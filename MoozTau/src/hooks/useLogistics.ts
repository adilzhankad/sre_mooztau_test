import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as logisticsApi from "@/api/logistics";
import type {
  AssignCourierPayload,
  DispatchPayload,
  DeliverPayload,
  StartMatchingPayload,
  SelectMasterPayload,
} from "@/types";

export function useLogisticsOrders(statusFilter?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.logistics, "orders", statusFilter],
    queryFn: () => logisticsApi.getLogisticsOrders(statusFilter),
  });
}

export function useLogisticsDashboard() {
  return useQuery({
    queryKey: [QUERY_KEYS.logistics, "dashboard"],
    queryFn: logisticsApi.getLogisticsDashboard,
  });
}

export function useAssignCourier(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignCourierPayload) => logisticsApi.assignCourier(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.logistics] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}

export function useDispatchOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DispatchPayload) => logisticsApi.dispatchOrder(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.logistics] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}

export function useDeliverOrder(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliverPayload) => logisticsApi.deliverOrder(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.logistics] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}

export function useStartMatching(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StartMatchingPayload = {}) => logisticsApi.startMatching(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.logistics] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}

export function useSelectMaster(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SelectMasterPayload) => logisticsApi.selectMaster(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.logistics] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
    },
  });
}
