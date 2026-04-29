import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeToggle({
  compact = false,
  darkSurface = false,
}: {
  compact?: boolean;
  darkSurface?: boolean;
}) {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      style={{
        height: compact ? 36 : 40,
        minWidth: compact ? 36 : 120,
        padding: compact ? 0 : "0 12px",
        borderRadius: compact ? 12 : 999,
        border: darkSurface ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--border)",
        background: darkSurface ? "rgba(255,255,255,0.08)" : "var(--bg-surface)",
        color: darkSurface ? "#fff" : "var(--text-default)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 0 : 8,
        boxShadow: compact ? "none" : "var(--shadow-sm)",
        transition: "all var(--t-base)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark
            ? "rgba(157,207,0,0.18)"
            : darkSurface
              ? "rgba(255,255,255,0.12)"
              : "var(--brand-light)",
          fontSize: 12,
        }}
      >
        {isDark ? "🌙" : "☀"}
      </span>
      {!compact && (
        <span style={{ fontSize: 12, fontWeight: 700 }}>
          {isDark ? t("theme.dark") : t("theme.light")}
        </span>
      )}
    </button>
  );
}
