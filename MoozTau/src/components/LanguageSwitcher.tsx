import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, setLang, type Lang } from "@/i18n";

export function LanguageSwitcher({ variant = "select" }: { variant?: "select" | "buttons" }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "ru").slice(0, 2) as Lang;

  if (variant === "buttons") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        {SUPPORTED_LANGS.map((lng) => (
          <button
            key={lng}
            type="button"
            onClick={() => setLang(lng)}
            className={`btn btn-sm ${current === lng ? "btn-primary" : "btn-ghost"}`}
            style={{ minWidth: 48 }}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label" htmlFor="lang-select">{t("language.label")}</label>
      <select
        id="lang-select"
        className="input"
        value={current}
        onChange={(e) => setLang(e.target.value as Lang)}
      >
        {SUPPORTED_LANGS.map((lng) => (
          <option key={lng} value={lng}>{t(`language.${lng}`)}</option>
        ))}
      </select>
    </div>
  );
}
