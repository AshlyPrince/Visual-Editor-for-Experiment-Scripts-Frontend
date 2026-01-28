import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

let isInitialized = false;

const initializeI18n = async () => {
  if (isInitialized) return i18n;

  const en = await import('./locales/en.json');
  const de = await import('./locales/de.json');

  const getInitialLanguage = () => {
    try {
      return localStorage.getItem('i18nextLng') || 'en';
    } catch (e) {
      return 'en';
    }
  };

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en.default },
        de: { translation: de.default }
      },
      fallbackLng: 'en',
      lng: getInitialLanguage(),
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });

  i18n.on('languageChanged', (lng) => {
    try {
      localStorage.setItem('i18nextLng', lng);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  });

  isInitialized = true;
  return i18n;
};

initializeI18n();

export default i18n;
