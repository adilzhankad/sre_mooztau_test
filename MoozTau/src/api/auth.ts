import { authApi } from "@/lib/axios";
import type { LoginRequest, TokenResponse, MeResponse, UpdateMeRequest, ProfileSummary } from "@/types";

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const res = await authApi.post<TokenResponse>("/api/auth/login", data);
  return res.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await authApi.get<MeResponse>("/api/auth/me");
  return res.data;
}

export async function updateMe(data: UpdateMeRequest): Promise<MeResponse> {
  const res = await authApi.patch<MeResponse>("/api/auth/me", data);
  return res.data;
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  const res = await authApi.get<ProfileSummary>("/api/auth/profile/summary");
  return res.data;
}

export interface RoleOption {
  value: string;
  label: string;
  group: "admin" | "dealer" | "factory" | "service" | "client" | string;
}

export async function getRoles(): Promise<RoleOption[]> {
  const res = await authApi.get<RoleOption[]>("/api/auth/roles");
  return res.data;
}

export async function logout(): Promise<void> {
  await authApi.post("/api/auth/logout");
}

export async function changePassword(old_password: string, new_password: string): Promise<void> {
  await authApi.post("/api/auth/change-password", { old_password, new_password });
}

export async function requestReset(phone: string): Promise<void> {
  await authApi.post("/api/auth/request-reset", { phone });
}

export async function resetPassword(phone: string, code: string, new_password: string): Promise<void> {
  await authApi.post("/api/auth/reset-password", { phone, code, new_password });
}

// ── Buyer auth ──

export async function buyerLogin(data: LoginRequest): Promise<TokenResponse> {
  const res = await authApi.post<TokenResponse>("/api/buyer/auth", data);
  return res.data;
}

export async function buyerRefreshToken(refreshToken: string): Promise<TokenResponse> {
  const res = await authApi.post<TokenResponse>("/api/buyer/auth/refresh", { refresh_token: refreshToken });
  return res.data;
}

export async function buyerResetPassword(phone: string, code: string, new_password: string): Promise<void> {
  await authApi.post("/api/buyer/auth/reset-password", { phone, code, new_password });
}
