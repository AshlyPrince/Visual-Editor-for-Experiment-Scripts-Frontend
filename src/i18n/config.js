import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const getInitialLanguage = () => {
  try {
    return localStorage.getItem('i18nextLng') || 'en';
  } catch (e) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: {} },
      de: { translation: {} }
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

Promise.all([
  import('./locales/en.json'),
  import('./locales/de.json')
]).then(([en, de]) => {
  i18n.addResourceBundle('en', 'translation', en.default, true, true);
  i18n.addResourceBundle('de', 'translation', de.default, true, true);
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng);
  } catch (e) {
    console.error('Failed to save language preference:', e);
  }
});

export default i18n;
