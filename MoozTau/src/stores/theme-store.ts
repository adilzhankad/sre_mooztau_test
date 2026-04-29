import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const STORAGE_KEY = "mooztau_theme";

function getInitialTheme(): ThemeMode {
  try {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted === "light" || persisted === "dark") return persisted;
  } catch {
    // Ignore storage errors and fall back to system theme.
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
}

function persistTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialTheme(),
  setMode: (mode) => {
    persistTheme(mode);
    set({ mode });
  },
  toggleMode: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";
      persistTheme(next);
      return { mode: next };
    }),
}));
