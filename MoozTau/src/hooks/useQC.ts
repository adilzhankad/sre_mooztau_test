import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as qcApi from "@/api/qc";
import type { QCChecklistCreate, QCRejectPayload } from "@/types";

export function useQCQueue() {
  return useQuery({
    queryKey: [QUERY_KEYS.qc, "queue"],
    queryFn: qcApi.getQCQueue,
  });
}

export function useQCChecklist(orderId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.qc, "checklist", orderId],
    queryFn: () => qcApi.getQCChecklist(orderId!),
    enabled: orderId != null,
  });
}

export function useSaveQCChecklist(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QCChecklistCreate) => qcApi.saveQCChecklist(orderId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.qc] }),
  });
}

export function usePassQC(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => qcApi.passQC(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.qc] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.factory] });
    },
  });
}

export function useRejectQC(orderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QCRejectPayload) => qcApi.rejectQC(orderId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.qc] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.orders] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.factory] });
    },
  });
}

export function useQCHistory(orderId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.qc, "history", orderId],
    queryFn: () => qcApi.getQCHistory(orderId!),
    enabled: orderId != null,
  });
}
