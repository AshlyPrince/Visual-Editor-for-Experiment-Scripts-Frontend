import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const getInitialLanguage = () => {
  try {
    return localStorage.getItem('i18nextLng') || 'en';
  } catch (e) {
    return 'en';
  }
};

export const i18nInitPromise = new Promise((resolve) => {
  console.log('[i18n] Starting initialization...');
  
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      lng: getInitialLanguage(),
      supportedLngs: ['en', 'de'],
      
      backend: {
        loadPath: '/locales/{{lng}}.json',
        requestOptions: {
          cache: 'default'
        }
      },
      
      interpolation: {
        escapeValue: false
      },
      
      react: {
        useSuspense: false
      }
    }, (err) => {
      if (err) {
        console.error('[i18n] Initialization error:', err);
      }
      console.log('[i18n] Initialized and translations loaded');
      console.log('[i18n] Available languages:', i18n.languages);
      console.log('[i18n] Current language:', i18n.language);
      console.log('[i18n] Has en translations:', i18n.hasResourceBundle('en', 'translation'));
      console.log('[i18n] Has de translations:', i18n.hasResourceBundle('de', 'translation'));
      resolve(i18n);
    });
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng);
  } catch (e) {
    console.error('Failed to save language preference:', e);
  }
});

export default i18n;
