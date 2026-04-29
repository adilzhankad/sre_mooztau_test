import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { QUERY_KEYS } from "@/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { UpdateMeRequest } from "@/types";

export function useMe() {
  return useQuery({
    queryKey: [QUERY_KEYS.me],
    queryFn: authApi.getMe,
  });
}

export function useProfileSummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.profileSummary],
    queryFn: authApi.getProfileSummary,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles-reference"],
    queryFn: authApi.getRoles,
    staleTime: 60 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const organizationId = useAuthStore((state) => state.organizationId);
  const organizationName = useAuthStore((state) => state.organizationName);

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => authApi.updateMe(data),
    onSuccess: (me) => {
      setUser({
        userId: me.id,
        role: me.role,
        organizationId: me.organization_id ?? organizationId ?? 0,
        fullName: me.full_name,
        organizationName: me.organization_name ?? organizationName ?? "",
      });

      queryClient.setQueryData([QUERY_KEYS.me], me);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.profileSummary] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.me] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      authApi.changePassword(oldPassword, newPassword),
  });
}
