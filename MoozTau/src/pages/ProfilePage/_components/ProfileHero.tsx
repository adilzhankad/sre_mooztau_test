import { useTranslation } from "react-i18next";

interface ProfileHeroProps {
  initials: string;
  fullName: string;
  roleLabel: string;
  organizationName: string;
  isActive: boolean;
  onEdit: () => void;
}

export function ProfileHero({
  initials,
  fullName,
  roleLabel,
  organizationName,
  isActive,
  onEdit,
}: ProfileHeroProps) {
  const { t } = useTranslation();

  return (
    <section className="profile-hero">
      <div className="profile-hero-copy">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-text">
          <span className="profile-kicker">{t("profile.kicker")}</span>
          <h1>{fullName}</h1>
          <div className="profile-hero-meta">
            <span className="profile-role-pill">{roleLabel}</span>
            <span className={`profile-status-pill ${isActive ? "is-active" : "is-inactive"}`}>
              {isActive ? t("profile.accountActive") : t("profile.accountInactive")}
            </span>
          </div>
          <p>{organizationName}</p>
        </div>
      </div>

      <div className="profile-hero-actions">
        <button className="btn btn-secondary btn-lg" onClick={onEdit}>
          {t("profile.editButton")}
        </button>
      </div>
    </section>
  );
}
