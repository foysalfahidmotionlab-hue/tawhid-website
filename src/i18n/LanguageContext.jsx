import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { strings } from './strings';

/**
 * Bangla is the main language. The visitor's choice is remembered in this
 * browser only; every first visit opens in Bangla.
 */
const STORAGE_KEY = 'zinia-lang';
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const LanguageContext = createContext(null);

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'bn';
  } catch {
    return 'bn';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readSaved);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = strings[lang].meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', strings[lang].meta.description);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable — language still works for this visit */
    }
  }, [lang]);

  const value = useMemo(() => {
    /** Digits in the active language: 48 → ৪৮ in Bangla. */
    const num = (v) => (lang === 'bn' ? String(v).replace(/\d/g, (d) => BN_DIGITS[d]) : String(v));
    /** Look up interface text by path, e.g. t('nav.home'); {name} placeholders filled from vars. */
    const tFor = (l) => (path, vars) => {
      let s = path.split('.').reduce((o, k) => o?.[k], strings[l]);
      if (s === undefined) return path;
      if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
      return s;
    };
    const t = tFor(lang);
    /** Pick the active language from a bilingual value { bn, en }. */
    const tr = (v) => (v && typeof v === 'object' && 'bn' in v ? v[lang] : v);
    return { lang, setLang, t, tFor, tr, num };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
