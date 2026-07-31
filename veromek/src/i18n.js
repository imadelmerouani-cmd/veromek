import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

const STORAGE_KEY = "veromek-language";
const SUPPORTED = ["en", "es", "fr"];

function normalize(value) {
  const language = String(value || "").toLowerCase().split("-")[0];
  return SUPPORTED.includes(language) ? language : "en";
}

async function detectLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return normalize(saved);

  try {
    const response = await fetch("/api/country", {
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const { country } = await response.json();
      if (country === "FR") return "fr";
      if (country === "ES") return "es";
      return "en";
    }
  } catch (error) {
    console.warn("Country detection unavailable:", error);
  }

  return normalize(navigator.languages?.[0] || navigator.language || "en");
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: "en",
  fallbackLng: "en",
  supportedLngs: SUPPORTED,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

detectLanguage().then((language) => {
  i18n.changeLanguage(language);
  document.documentElement.lang = language;
});

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = normalize(language);
});

export function changeStoreLanguage(language) {
  const normalized = normalize(language);
  localStorage.setItem(STORAGE_KEY, normalized);
  return i18n.changeLanguage(normalized);
}

export default i18n;
