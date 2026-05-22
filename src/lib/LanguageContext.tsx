import React, { createContext, useContext, useState, useEffect } from 'react';
import { EN, ES, Translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // The language a visitor starts in is locked for the whole session and
    // every future visit: we read the saved choice if there is one, otherwise
    // detect once from the browser and immediately persist it. After this runs
    // the language never changes on its own — only an explicit toggle does.
    const savedLang = localStorage.getItem('heylola_lang') as Language;
    if (savedLang === 'en' || savedLang === 'es') {
      setLanguageState(savedLang);
      return;
    }
    const browserLang = navigator.language.split('-')[0];
    const detected: Language = browserLang === 'es' ? 'es' : 'en';
    setLanguageState(detected);
    try { localStorage.setItem('heylola_lang', detected); } catch { /* ignore */ }
  }, []);

  // Keep the document language in sync for accessibility and SEO.
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('heylola_lang', lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
  };

  const t = language === 'es' ? ES : EN;

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
