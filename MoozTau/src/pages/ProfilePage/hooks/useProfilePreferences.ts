import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLang, SUPPORTED_LANGS, type Lang } from "@/i18n";

interface ProfilePreferences {
  compactMode: boolean;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = "mooztau_profile_preferences";

const DEFAULT_PREFERENCES: ProfilePreferences = {
  compactMode: false,
  notificationsEnabled: true,
};

function loadPreferences(): ProfilePreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function useProfilePreferences() {
  const { i18n } = useTranslation();
  const [prefs, setPrefs] = useState<ProfilePreferences>(loadPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const rawLang = (i18n.resolvedLanguage ?? i18n.language ?? "ru").slice(0, 2);
  const language = (SUPPORTED_LANGS as readonly string[]).includes(rawLang) ? (rawLang as Lang) : "ru";

  return {
    preferences: { ...prefs, language },
    setLanguage: (lang: Lang) => setLang(lang),
    setCompactMode: (compactMode: boolean) =>
      setPrefs((current) => ({ ...current, compactMode })),
    setNotificationsEnabled: (notificationsEnabled: boolean) =>
      setPrefs((current) => ({ ...current, notificationsEnabled })),
  };
}
