import { getLang, getLangShortLabel, getNextLang, setLang } from "@/i18n";
import { useTranslation } from "react-i18next";

export function LanguageCycleToggle({
  compact = false,
  darkSurface = false,
}: {
  compact?: boolean;
  darkSurface?: boolean;
}) {
  const { i18n, t } = useTranslation();
  const current = getLang();
  const next = getNextLang(current);
  const currentLabel = getLangShortLabel(current);
  const nextLabel = getLangShortLabel(next);

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={`${t("language.label")}: ${nextLabel}`}
      title={`${t("language.label")}: ${currentLabel} -> ${nextLabel}`}
      style={{
        height: compact ? 36 : 40,
        minWidth: compact ? 56 : 88,
        padding: compact ? "0 10px" : "0 12px",
        borderRadius: compact ? 12 : 999,
        border: darkSurface ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--border)",
        background: darkSurface ? "rgba(255,255,255,0.08)" : "var(--bg-surface)",
        color: darkSurface ? "#fff" : "var(--text-default)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
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
          background: darkSurface ? "rgba(255,255,255,0.12)" : "var(--brand-light)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.2,
        }}
      >
        {currentLabel.slice(0, 1)}
      </span>
      <span
        key={i18n.resolvedLanguage}
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.4,
        }}
      >
        {currentLabel}
      </span>
    </button>
  );
}
