import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DICTS, type LangCode, LANGUAGES, type StringKey } from "./locales";

const STORAGE_KEY = "warera-sverige-lang";

type Vars = Record<string, string | number>;

interface LangContextValue {
  lang: LangCode | null;
  setLang: (code: LangCode) => void;
  t: (key: StringKey, vars?: Vars) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function isLang(v: string | null): v is LangCode {
  return LANGUAGES.some((l) => l.code === v);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : `{{${k}}}`));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLang(stored) ? stored : null;
  });

  const setLang = useCallback((code: LangCode) => {
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
    setLangState(code);
  }, []);

  const t = useCallback(
    (key: StringKey, vars?: Vars) => {
      const dict = DICTS[lang ?? "en"];
      return interpolate(dict[key] ?? key, vars);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLang().t;
}
