import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadTranslations = async () => {
  const en = await import('./locales/en.json');
  const de = await import('./locales/de.json');
  return { en: en.default, de: de.default };
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: {} },
      de: { translation: {} }
    },
    fallbackLng: 'en',
    lng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

loadTranslations().then(({ en, de }) => {
  i18n.addResourceBundle('en', 'translation', en, true, true);
  i18n.addResourceBundle('de', 'translation', de, true, true);
});

export default i18n;
