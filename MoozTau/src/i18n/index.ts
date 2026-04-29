import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ru from "./locales/ru.json";
import kk from "./locales/kk.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGS = ["ru", "kk", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const STORAGE_KEY = "mooztau_lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk },
      en: { translation: en },
    },
    fallbackLng: "ru",
    supportedLngs: SUPPORTED_LANGS,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

export function setLang(lang: Lang) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

export function getLang(): Lang {
  const raw = (i18n.resolvedLanguage ?? i18n.language ?? "ru").slice(0, 2);
  return (SUPPORTED_LANGS as readonly string[]).includes(raw) ? (raw as Lang) : "ru";
}

export function getLangLocale(lang: Lang = getLang()): string {
  if (lang === "kk") return "kk-KZ";
  if (lang === "en") return "en-US";
  return "ru-RU";
}

export function getNextLang(current: Lang = getLang()): Lang {
  const index = SUPPORTED_LANGS.indexOf(current);
  return SUPPORTED_LANGS[(index + 1) % SUPPORTED_LANGS.length];
}

export function getLangShortLabel(lang: Lang): "RU" | "KZ" | "ENG" {
  if (lang === "ru") return "RU";
  if (lang === "kk") return "KZ";
  return "ENG";
}

export default i18n;
