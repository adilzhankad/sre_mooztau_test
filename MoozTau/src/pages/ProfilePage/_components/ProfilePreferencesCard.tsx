import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type Lang } from "@/i18n";

interface ProfilePreferencesCardProps {
  language: Lang;
  compactMode: boolean;
  notificationsEnabled: boolean;
  onLanguageChange: (value: Lang) => void;
  onCompactModeChange: (value: boolean) => void;
  onNotificationsChange: (value: boolean) => void;
}

export function ProfilePreferencesCard({
  language,
  compactMode,
  notificationsEnabled,
  onLanguageChange,
  onCompactModeChange,
  onNotificationsChange,
}: ProfilePreferencesCardProps) {
  const { t } = useTranslation();

  return (
    <section className="profile-card" id="preferences">
      <div className="profile-card-head">
        <div>
          <h2>{t("profile.preferences.title")}</h2>
          <p>{t("profile.preferences.description")}</p>
        </div>
      </div>

      <div className="profile-preferences">
        <label className="profile-field">
          <span>{t("language.label")}</span>
          <select className="input" value={language} onChange={(e) => onLanguageChange(e.target.value as Lang)}>
            {SUPPORTED_LANGS.map((lng) => (
              <option key={lng} value={lng}>{t(`language.${lng}`)}</option>
            ))}
          </select>
        </label>

        <ToggleRow
          label={t("profile.preferences.compactMode")}
          description={t("profile.preferences.compactModeDesc")}
          checked={compactMode}
          onChange={onCompactModeChange}
        />

        <ToggleRow
          label={t("profile.preferences.notifications")}
          description={t("profile.preferences.notificationsDesc")}
          checked={notificationsEnabled}
          onChange={onNotificationsChange}
        />
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="profile-toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        className={`profile-toggle ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span />
      </button>
    </div>
  );
}
