import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import * as authApi from "@/api/auth";
import type { LoginRequest } from "@/types";

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginRequest) {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login(data);
      setTokens(tokens.access_token, tokens.refresh_token);

      // Token response already has role & full_name;
      // fetch /me for organization_name
      setUser({
        userId: tokens.user_id,
        role: tokens.role,
        organizationId: tokens.organization_id ?? 0,
        fullName: tokens.full_name,
        organizationName: "",
      });

      // Fetch full profile in background for org name
      try {
        const me = await authApi.getMe();
        setUser({
          userId: me.id,
          role: me.role,
          organizationId: me.organization_id ?? 0,
          fullName: me.full_name,
          organizationName: me.organization_name ?? "",
        });
      } catch {
        // non-critical — we already have basic info from token response
      }
    } catch (err: any) {
      const message =
        err.response?.data?.detail ?? "Не удалось войти. Проверьте данные.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}

export function useLogout() {
  const { logout: clearAuth } = useAuthStore();

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear local state regardless
    }
    clearAuth();
  }

  return { logout };
}
