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

// Don't initialize immediately - export a promise
export const i18nInitPromise = i18n
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
      useSuspense: false  // Back to false, we'll handle loading manually
    }
  })
  .then(() => {
    console.log('i18n initialized successfully');
    return i18n;
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng);
  } catch (e) {
    console.error('Failed to save language preference:', e);
  }
});

export default i18n;
