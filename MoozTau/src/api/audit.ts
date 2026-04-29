import { auditApi } from "@/lib/axios";
import type { AuditFilters, AuditLog, AuditLogListResponse, SuspiciousPatterns } from "@/types";

function normalizeAuditLogListResponse(data: AuditLogListResponse | AuditLog[]): AuditLogListResponse {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      page: 1,
      page_size: data.length || 50,
      pages: 1,
    };
  }

  return {
    count: data.count ?? data.results?.length ?? 0,
    results: Array.isArray(data.results) ? data.results : [],
    page: data.page ?? 1,
    page_size: data.page_size ?? data.results?.length ?? 50,
    pages: data.pages ?? 1,
  };
}

export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLogListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== ""),
  );
  const { data } = await auditApi.get("/api/audit/logs", { params });
  return normalizeAuditLogListResponse(data);
}

export async function getResourceHistory(
  resourceType: string,
  resourceId: string,
  page = 1,
  pageSize = 50,
): Promise<AuditLogListResponse> {
  const { data } = await auditApi.get(`/api/audit/logs/${resourceType}/${resourceId}`, {
    params: { page, page_size: pageSize },
  });
  return normalizeAuditLogListResponse(data);
}

export async function getUserActivity(
  userId: number,
  page = 1,
  pageSize = 50,
): Promise<AuditLogListResponse> {
  const { data } = await auditApi.get(`/api/audit/users/${userId}/activity`, {
    params: { page, page_size: pageSize },
  });
  return normalizeAuditLogListResponse(data);
}

export async function getSuspiciousPatterns(): Promise<SuspiciousPatterns> {
  const { data } = await auditApi.get("/api/audit/suspicious");
  return data;
}
