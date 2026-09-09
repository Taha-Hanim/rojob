import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "../i18n/en";
import pl from "../i18n/pl";

const LangContext = createContext(null);
const STORAGE_KEY = "rojob_lang";

const dictionaries = { en, pl };

function resolveKey(obj, key) {
  return key.split(".").reduce((acc, part) => {
    if (acc == null) return undefined;
    return acc[part];
  }, obj);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "pl" ? "pl" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage failures
    }
    document.documentElement.lang = lang === "pl" ? "pl" : "en";
  }, [lang]);

  const setLang = (next) => setLangState(next === "pl" ? "pl" : "en");

  const t = (key, fallback = key) => {
    const value = resolveKey(dictionaries[lang], key);
    if (value == null) {
      const enValue = resolveKey(dictionaries.en, key);
      return enValue ?? fallback;
    }
    return value;
  };

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
