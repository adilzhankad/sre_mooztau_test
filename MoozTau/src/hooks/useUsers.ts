import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import * as usersApi from "@/api/users";
import type { UserCreate, UserUpdate, OrganizationCreate, OrganizationUpdate } from "@/types";

// ── Users ──

export function useUsers() {
  return useQuery({
    queryKey: [QUERY_KEYS.users],
    queryFn: usersApi.getUsers,
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.users, id],
    queryFn: () => usersApi.getUser(id!),
    enabled: id != null,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => usersApi.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserUpdate) => usersApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.toggleUserActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.users] }),
  });
}

// ── Organizations ──

export function useOrganizations() {
  return useQuery({
    queryKey: [QUERY_KEYS.organizations],
    queryFn: usersApi.getOrganizations,
  });
}

export function useOrganization(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.organizations, id],
    queryFn: () => usersApi.getOrganization(id!),
    enabled: id != null,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrganizationCreate) => usersApi.createOrganization(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.organizations] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrganizationUpdate }) =>
      usersApi.updateOrganization(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.organizations] }),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deleteOrganization(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.organizations] }),
  });
}
