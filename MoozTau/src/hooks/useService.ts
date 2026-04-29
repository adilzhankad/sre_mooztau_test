import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as serviceApi from "@/api/service";
import type {
  PublicServiceRequestCreate,
  ServiceRequestCreate,
  ServiceRequestFilters,
  ServiceRequestUpdate,
} from "@/types";

export function useServiceRequests(filters: ServiceRequestFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.service, filters],
    queryFn: () => serviceApi.getServiceRequests(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useServiceMasters() {
  return useQuery({
    queryKey: [QUERY_KEYS.service, "masters"],
    queryFn: serviceApi.getServiceMasters,
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceRequestCreate) => serviceApi.createServiceRequest(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.service] }),
  });
}

export function useCreatePublicServiceRequest() {
  return useMutation({
    mutationFn: (payload: PublicServiceRequestCreate) => serviceApi.createPublicServiceRequest(payload),
  });
}

export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ServiceRequestUpdate }) =>
      serviceApi.updateServiceRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.service] }),
  });
}

export function useTakeServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceApi.takeServiceRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.service] }),
  });
}
