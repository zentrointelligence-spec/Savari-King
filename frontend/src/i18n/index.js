import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Import translation files
import enTranslations from "./locales/en.json";
import frTranslations from "./locales/fr.json";
import esTranslations from "./locales/es.json";
import itTranslations from "./locales/it.json";
import zhTranslations from "./locales/zh.json";
import hiTranslations from "./locales/hi.json";
import msTranslations from "./locales/ms.json";

// Language mapping for geolocation
export const LANGUAGE_MAPPING = {
  // English-speaking countries
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  ZA: "en",
  IN: "en",
  SG: "en",
  MY: "en",
  PH: "en",
  NG: "en",
  KE: "en",
  GH: "en",

  // French-speaking countries
  FR: "fr",
  BE: "fr",
  CH: "fr",
  LU: "fr",
  MC: "fr",
  SN: "fr",
  CI: "fr",
  ML: "fr",
  BF: "fr",
  NE: "fr",
  TD: "fr",
  MG: "fr",
  CM: "fr",
  GA: "fr",
  CG: "fr",
  CF: "fr",
  DJ: "fr",
  KM: "fr",
  VU: "fr",
  NC: "fr",
  PF: "fr",

  // Spanish-speaking countries
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  CL: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  PR: "es",
  GQ: "es",

  // Italian-speaking countries
  IT: "it",
  SM: "it",
  VA: "it",

  // Chinese-speaking countries/regions
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",

  // Hindi-speaking regions (primarily India, but English is also official)
  // We'll use a more specific detection for Hindi in the geolocation function

  // Malay-speaking countries
  MY: "ms",
  BN: "ms",
  SG: "ms",
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
];

// Geolocation-based language detection
export const detectLanguageFromGeolocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("en"); // Default to English if geolocation is not supported
      return;
    }

    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000, // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Use a reverse geocoding service to get country code
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (response.ok) {
            const data = await response.json();
            const countryCode = data.countryCode;

            // Map country code to language
            const detectedLanguage = LANGUAGE_MAPPING[countryCode] || "en";
            resolve(detectedLanguage);
          } else {
            resolve("en");
          }
        } catch (error) {
          console.warn("Geolocation language detection failed:", error);
          resolve("en");
        }
      },
      (error) => {
        console.warn("Geolocation access denied or failed:", error);
        resolve("en");
      },
      options
    );
  });
};

// Custom language detector that includes geolocation
const customLanguageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      // First, try to get language from localStorage
      const storedLanguage = localStorage.getItem("i18nextLng");
      if (
        storedLanguage &&
        SUPPORTED_LANGUAGES.some((lang) => lang.code === storedLanguage)
      ) {
        callback(storedLanguage);
        return;
      }

      // Then try geolocation
      const geoLanguage = await detectLanguageFromGeolocation();
      if (
        geoLanguage &&
        SUPPORTED_LANGUAGES.some((lang) => lang.code === geoLanguage)
      ) {
        callback(geoLanguage);
        return;
      }

      // Fallback to browser language
      const browserLanguage = navigator.language || navigator.languages?.[0];
      if (browserLanguage) {
        const langCode = browserLanguage.split("-")[0];
        if (SUPPORTED_LANGUAGES.some((lang) => lang.code === langCode)) {
          callback(langCode);
          return;
        }
      }

      // Final fallback to English
      callback("en");
    } catch (error) {
      console.warn("Language detection failed:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: (lng) => {
    localStorage.setItem("i18nextLng", lng);
  },
};

i18n
  .use(Backend)
  .use(customLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,

    // Resources - inline translations
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
      es: { translation: esTranslations },
      it: { translation: itTranslations },
      zh: { translation: zhTranslations },
      hi: { translation: hiTranslations },
      ms: { translation: msTranslations },
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Language detection options
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },

    // Backend options (for future use with external translation files)
    backend: {
      loadPath: "/locales/{{lng}}.json",
    },
  });

export default i18n;
