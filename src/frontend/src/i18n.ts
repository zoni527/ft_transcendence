import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { enTranslations } from './locales/en';
import { fiTranslations } from './locales/fi';
import { csTranslations } from './locales/cs';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fi: { translation: fiTranslations },
      cs: { translation: csTranslations },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
