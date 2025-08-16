import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Function to change language and update document direction
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  
  // Update document direction for RTL support
  if (language === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }
  
  // Store language preference
  localStorage.setItem('i18nextLng', language);
};

// Initialize language on app start
export const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
  changeLanguage(savedLanguage);
};

export default i18n; 