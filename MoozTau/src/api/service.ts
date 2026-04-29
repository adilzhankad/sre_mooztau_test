import { ordersApi } from "@/lib/axios";
import type {
  Paginated,
  PublicServiceRequestCreate,
  PublicServiceRequestResponse,
  ServiceMaster,
  ServiceRequest,
  ServiceRequestCreate,
  ServiceRequestFilters,
  ServiceRequestUpdate,
} from "@/types";

export async function getServiceRequests(
  filters: ServiceRequestFilters = {},
): Promise<Paginated<ServiceRequest>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value != null && value !== ""),
  );
  const { data } = await ordersApi.get("/api/service/requests", { params });
  return data;
}

export async function getServiceMasters(): Promise<ServiceMaster[]> {
  const { data } = await ordersApi.get("/api/service/masters");
  return data;
}

export async function createServiceRequest(payload: ServiceRequestCreate): Promise<ServiceRequest> {
  const { data } = await ordersApi.post("/api/service/requests", payload);
  return data;
}

export async function createPublicServiceRequest(
  payload: PublicServiceRequestCreate,
): Promise<PublicServiceRequestResponse> {
  const { data } = await ordersApi.post("/api/service/public/requests", payload);
  return data;
}

export async function updateServiceRequest(
  id: number,
  payload: ServiceRequestUpdate,
): Promise<ServiceRequest> {
  const { data } = await ordersApi.patch(`/api/service/requests/${id}`, payload);
  return data;
}

export async function takeServiceRequest(id: number): Promise<ServiceRequest> {
  const { data } = await ordersApi.post(`/api/service/requests/${id}/take`);
  return data;
}
