'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enTranslations from '@/src/locales/en.json';
import kaTranslations from '@/src/locales/ka.json';

export type Language = 'ka' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  getItemTranslation: (itemId: string) => {
    name: string;
    description: string;
    longDescription: string;
    badge?: string;
    beefWeight?: string;
    volume?: string;
    allergens?: string;
  };
  getIngredientName: (ingredientId: string, fallback?: string) => string;
  getExtraName: (extraId: string, fallback?: string) => string;
  getCategoryName: (categoryKey: string) => string;
  getChoiceOptionName: (optionId: string, fallback?: string) => string;
  getChoiceGroupTitle: (groupId: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_LANG_KEY = 'bun_patty_lang_preference';
// Storage key used before the BUN & PATTY rename (read once for migration only)
const LEGACY_LANG_STORAGE_KEY = 'peach_patty_lang_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Georgian ('ka') as requested, initialized lazily from localStorage if present
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        let savedLang = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
        if (!savedLang) {
          savedLang = localStorage.getItem(LEGACY_LANG_STORAGE_KEY);
          if (savedLang) {
            try {
              localStorage.setItem(LOCAL_STORAGE_LANG_KEY, savedLang);
            } catch {
              // ignore
            }
          }
        }
        if (savedLang === 'ka' || savedLang === 'en') {
          return savedLang;
        }
      } catch (e) {
        console.warn('Unable to access localStorage for language preference', e);
      }
    }
    return 'ka';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_LANG_KEY, lang);
    } catch (e) {
      console.warn('Error saving language preference', e);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const translations = useMemo(() => {
    return language === 'ka' ? kaTranslations : enTranslations;
  }, [language]);

  const fallbackTranslations = useMemo(() => {
    return enTranslations;
  }, []);

  /**
   * Translates dot-separated key paths like "nav.menu" or "common.cart".
   * Replaces variables like {count} or {price}.
   */
  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');

      let value: any = translations;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      // Fallback to English if translation is missing
      if (value === undefined || value === null) {
        let fallbackVal: any = fallbackTranslations;
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        value = fallbackVal !== undefined ? fallbackVal : path;
      }

      let result = String(value);
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return result;
    },
    [translations, fallbackTranslations]
  );

  const getItemTranslation = useCallback(
    (itemId: string) => {
      const dict = (translations as any).items?.[itemId] || (fallbackTranslations as any).items?.[itemId] || {};
      return {
        name: dict.name || itemId,
        description: dict.description || '',
        longDescription: dict.longDescription || '',
        badge: dict.badge,
        beefWeight: dict.beefWeight,
        volume: dict.volume,
        allergens: dict.allergens,
      };
    },
    [translations, fallbackTranslations]
  );

  const getIngredientName = useCallback(
    (ingredientId: string, fallback?: string) => {
      return (
        (translations as any).ingredients?.[ingredientId] ||
        (fallbackTranslations as any).ingredients?.[ingredientId] ||
        fallback ||
        ingredientId
      );
    },
    [translations, fallbackTranslations]
  );

  const getExtraName = useCallback(
    (extraId: string, fallback?: string) => {
      return (
        (translations as any).extras?.[extraId] ||
        (fallbackTranslations as any).extras?.[extraId] ||
        fallback ||
        extraId
      );
    },
    [translations, fallbackTranslations]
  );

  const getCategoryName = useCallback(
    (categoryKey: string) => {
      return (
        (translations as any).categories?.[categoryKey] ||
        (fallbackTranslations as any).categories?.[categoryKey] ||
        categoryKey
      );
    },
    [translations, fallbackTranslations]
  );

  const getChoiceOptionName = useCallback(
    (optionId: string, fallback?: string) => {
      return (
        (translations as any).choiceOptions?.[optionId] ||
        (fallbackTranslations as any).choiceOptions?.[optionId] ||
        fallback ||
        optionId
      );
    },
    [translations, fallbackTranslations]
  );

  const getChoiceGroupTitle = useCallback(
    (groupId: string, fallback?: string) => {
      return (
        (translations as any).choiceTitles?.[groupId] ||
        (fallbackTranslations as any).choiceTitles?.[groupId] ||
        fallback ||
        groupId
      );
    },
    [translations, fallbackTranslations]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      getItemTranslation,
      getIngredientName,
      getExtraName,
      getCategoryName,
      getChoiceOptionName,
      getChoiceGroupTitle,
    }),
    [
      language,
      setLanguage,
      t,
      getItemTranslation,
      getIngredientName,
      getExtraName,
      getCategoryName,
      getChoiceOptionName,
      getChoiceGroupTitle,
    ]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
