import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as auditApi from "@/api/audit";
import type { AuditFilters } from "@/types";

export function useAuditLogs(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.audit, "logs", filters],
    queryFn: () => auditApi.getAuditLogs(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useResourceHistory(resourceType: string, resourceId: string, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: [QUERY_KEYS.audit, "resource", resourceType, resourceId, page, pageSize],
    queryFn: () => auditApi.getResourceHistory(resourceType, resourceId, page, pageSize),
    enabled: !!resourceType && !!resourceId,
  });
}

export function useUserActivity(userId: number | null, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: [QUERY_KEYS.audit, "user-activity", userId, page, pageSize],
    queryFn: () => auditApi.getUserActivity(userId!, page, pageSize),
    enabled: userId != null,
  });
}

export function useSuspiciousPatterns() {
  return useQuery({
    queryKey: [QUERY_KEYS.audit, "suspicious"],
    queryFn: auditApi.getSuspiciousPatterns,
  });
}
