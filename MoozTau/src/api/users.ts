import { authApi } from "@/lib/axios";
import type { User, UserCreate, UserUpdate, Organization, OrganizationCreate, OrganizationUpdate } from "@/types";

// ── Users ──

export async function getUsers(): Promise<User[]> {
  const { data } = await authApi.get("/api/users/");
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await authApi.get(`/api/users/${id}`);
  return data;
}

export async function createUser(user: UserCreate): Promise<User> {
  const { data } = await authApi.post("/api/users/", user);
  return data;
}

export async function updateUser(id: number, user: UserUpdate): Promise<User> {
  const { data } = await authApi.put(`/api/users/${id}`, user);
  return data;
}

export async function toggleUserActive(id: number): Promise<User> {
  const { data } = await authApi.patch(`/api/users/${id}/activate`);
  return data;
}

// ── Organizations ──

export async function getOrganizations(): Promise<Organization[]> {
  const { data } = await authApi.get("/api/organizations/");
  return data;
}

export async function getOrganization(id: number): Promise<Organization> {
  const { data } = await authApi.get(`/api/organizations/${id}`);
  return data;
}

export async function createOrganization(org: OrganizationCreate): Promise<Organization> {
  const { data } = await authApi.post("/api/organizations/", org);
  return data;
}

export async function updateOrganization(id: number, org: OrganizationUpdate): Promise<Organization> {
  const { data } = await authApi.put(`/api/organizations/${id}`, org);
  return data;
}

export async function deleteOrganization(id: number): Promise<void> {
  await authApi.delete(`/api/organizations/${id}`);
}
