import { useTranslation } from "react-i18next";

interface ProfileSecurityCardProps {
  onPasswordChange: () => void;
  onLogout: () => void;
}

export function ProfileSecurityCard({ onPasswordChange, onLogout }: ProfileSecurityCardProps) {
  const { t } = useTranslation();

  return (
    <section className="profile-card profile-card-accent">
      <div className="profile-card-head">
        <div>
          <h2>{t("profile.security.title")}</h2>
          <p>{t("profile.security.description")}</p>
        </div>
      </div>

      <div className="profile-security-actions">
        <button className="btn btn-primary btn-lg" onClick={onPasswordChange}>
          {t("profile.security.changePassword")}
        </button>
        <button className="btn btn-danger btn-lg" onClick={onLogout}>
          {t("profile.security.logout")}
        </button>
      </div>
    </section>
  );
}
