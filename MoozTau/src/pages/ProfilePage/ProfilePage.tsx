import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLogout } from "@/hooks/useAuth";
import { useChangePassword, useMe, useProfileSummary, useUpdateMe } from "@/hooks/useProfile";
import { getOrgTypeLabel, getInitials, getRoleLabel, formatDate, formatOptional, formatPhone } from "./utils";
import { useProfilePreferences } from "./hooks/useProfilePreferences";
import { ProfileHero } from "./_components/ProfileHero";
import { ProfileStats } from "./_components/ProfileStats";
import { ProfileInfoCard } from "./_components/ProfileInfoCard";
import { ProfilePreferencesCard } from "./_components/ProfilePreferencesCard";
import { ProfileSecurityCard } from "./_components/ProfileSecurityCard";
import { EditProfileModal } from "./_components/EditProfileModal";
import { ChangePasswordModal } from "./_components/ChangePasswordModal";

import "./profile-page.css";

export function ProfilePage() {
  const { t } = useTranslation();
  const { logout } = useLogout();
  const { data: me, isLoading: isMeLoading } = useMe();
  const { data: summary, isLoading: isSummaryLoading } = useProfileSummary();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();
  const { preferences, setLanguage, setCompactMode, setNotificationsEnabled } = useProfilePreferences();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash !== "#preferences") return;

    const element = document.getElementById("preferences");
    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const dash = t("common.dash");
  const currentName = me?.full_name ?? summary?.full_name ?? t("profile.fallbackName");
  const currentRole = me?.role ?? summary?.role;
  const currentOrgName = summary?.organization_name ?? me?.organization_name ?? t("profile.fallbackOrg");

  const stats = [
    {
      label: t("profile.stats.teammates"),
      value: summary ? String(summary.teammates_count) : dash,
      hint: t("profile.stats.teammatesHint"),
    },
    {
      label: t("profile.stats.active"),
      value: summary ? String(summary.active_teammates_count) : dash,
      hint: t("profile.stats.activeHint"),
    },
    {
      label: t("profile.stats.memberSince"),
      value: summary ? formatDate(summary.member_since) : dash,
      hint: t("profile.stats.memberSinceHint"),
    },
    {
      label: t("profile.stats.channelType"),
      value: summary ? getOrgTypeLabel(summary.organization_type) : dash,
      hint: t("profile.stats.channelTypeHint"),
    },
  ];

  const isLoading = isMeLoading || isSummaryLoading;

  return (
    <div className={`profile-page ${preferences.compactMode ? "is-compact" : ""}`}>
      <ProfileHero
        initials={getInitials(currentName)}
        fullName={currentName}
        roleLabel={getRoleLabel(currentRole)}
        organizationName={currentOrgName}
        isActive={me?.is_active ?? summary?.is_active ?? true}
        onEdit={() => setIsEditOpen(true)}
      />

      {isLoading ? (
        <div className="profile-loading">{t("profile.loading")}</div>
      ) : (
        <>
          <ProfileStats stats={stats} />

          <div className="profile-content-grid">
            <ProfileInfoCard
              title={t("profile.contacts.title")}
              description={t("profile.contacts.description")}
              actionLabel={t("profile.contacts.action")}
              onAction={() => setIsEditOpen(true)}
              rows={[
                { label: t("profile.contacts.fullName"), value: formatOptional(me?.full_name) },
                { label: t("profile.contacts.phone"), value: formatPhone(me?.phone) },
                { label: t("profile.contacts.email"), value: formatOptional(me?.email) },
                { label: t("profile.contacts.role"), value: getRoleLabel(currentRole) },
              ]}
            />

            <ProfileInfoCard
              title={t("profile.organization.title")}
              description={t("profile.organization.description")}
              rows={[
                { label: t("profile.organization.name"), value: formatOptional(summary?.organization_name) },
                { label: t("profile.organization.type"), value: getOrgTypeLabel(summary?.organization_type) },
                { label: t("profile.organization.region"), value: formatOptional(summary?.organization_region) },
                { label: t("profile.organization.address"), value: formatOptional(summary?.organization_address) },
                { label: t("profile.organization.phone"), value: formatPhone(summary?.organization_contact_phone) },
                { label: t("profile.organization.email"), value: formatOptional(summary?.organization_contact_email) },
                { label: t("profile.organization.connected"), value: formatDate(summary?.organization_created_at) },
              ]}
            />

            <ProfilePreferencesCard
              language={preferences.language}
              compactMode={preferences.compactMode}
              notificationsEnabled={preferences.notificationsEnabled}
              onLanguageChange={setLanguage}
              onCompactModeChange={setCompactMode}
              onNotificationsChange={setNotificationsEnabled}
            />

            <ProfileSecurityCard
              onPasswordChange={() => setIsPasswordOpen(true)}
              onLogout={logout}
            />
          </div>
        </>
      )}

      {me && isEditOpen ? (
        <EditProfileModal
          me={me}
          isPending={updateMe.isPending}
          onClose={() => setIsEditOpen(false)}
          onSubmit={async (data) => {
            await updateMe.mutateAsync(data);
          }}
        />
      ) : null}

      {isPasswordOpen ? (
        <ChangePasswordModal
          isPending={changePassword.isPending}
          onClose={() => setIsPasswordOpen(false)}
          onSubmit={async (data) => {
            await changePassword.mutateAsync(data);
          }}
        />
      ) : null}
    </div>
  );
}
