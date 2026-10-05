"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dictionaries, LANGS } from "./dictionaries";

const I18nContext = createContext(null);

function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("velora-lang") : null;
    if (saved && dictionaries[saved]) setLang(saved);
  }, []);

  const changeLang = useCallback((code) => {
    if (!dictionaries[code]) return;
    setLang(code);
    try {
      localStorage.setItem("velora-lang", code);
    } catch {}
  }, []);

  // t("hero.title1") -> string, falls back to English then the key.
  const t = useCallback(
    (key) => {
      const val = get(dictionaries[lang], key);
      if (val !== undefined) return val;
      const fallback = get(dictionaries.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, changeLang, t, langs: LANGS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback if a component renders outside the provider.
    return {
      lang: "en",
      changeLang: () => {},
      langs: LANGS,
      t: (key) => {
        const v = get(dictionaries.en, key);
        return v !== undefined ? v : key;
      },
    };
  }
  return ctx;
}
