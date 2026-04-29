import { create } from "zustand";
import type { UserRole } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  role: UserRole | null;
  organizationId: number | null;
  fullName: string | null;
  organizationName: string | null;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (data: {
    userId: number;
    role: UserRole;
    organizationId: number;
    fullName: string;
    organizationName: string;
  }) => void;
  logout: () => void;
}

const STORAGE_KEY = "mooztau_auth";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persist(partial: Partial<AuthState>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: partial.accessToken,
      refreshToken: partial.refreshToken,
      userId: partial.userId,
      role: partial.role,
      organizationId: partial.organizationId,
      fullName: partial.fullName,
      organizationName: partial.organizationName,
    }),
  );
}

const persisted = loadPersistedState();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: persisted.accessToken ?? null,
  refreshToken: persisted.refreshToken ?? null,
  userId: persisted.userId ?? null,
  role: persisted.role ?? null,
  organizationId: persisted.organizationId ?? null,
  fullName: persisted.fullName ?? null,
  organizationName: persisted.organizationName ?? null,
  isAuthenticated: !!persisted.accessToken,

  setTokens: (access, refresh) => {
    set((state) => {
      const next = { ...state, accessToken: access, refreshToken: refresh, isAuthenticated: true };
      persist(next);
      return next;
    });
  },

  setUser: (data) => {
    set((state) => {
      const next = {
        ...state,
        userId: data.userId,
        role: data.role,
        organizationId: data.organizationId,
        fullName: data.fullName,
        organizationName: data.organizationName,
      };
      persist(next);
      return next;
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      accessToken: null,
      refreshToken: null,
      userId: null,
      role: null,
      organizationId: null,
      fullName: null,
      organizationName: null,
      isAuthenticated: false,
    });
  },
}));
