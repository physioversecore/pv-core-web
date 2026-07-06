"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "@/translations";

const KEY = "sahayatri.lang";

type DeepKeys<T> = T extends Record<string, unknown>
  ? { [K in keyof T & string]: `${K}${T[K] extends Record<string, unknown> ? `.${DeepKeys<T[K]>}` : ""}` }[keyof T & string]
  : "";

export type TKey = DeepKeys<(typeof translations)["en"]>;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, fallback?: string) => string;
}

function resolve(obj: Record<string, unknown>, path: string): string | undefined {
  let current: unknown = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

const Ctx = createContext<I18nCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw === "en" || raw === "ne") setLangState(raw);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(KEY, l);
  };

  const t = useCallback(
    (key: TKey, fallback?: string): string => {
      return resolve(translations[lang] as unknown as Record<string, unknown>, key) ?? fallback ?? key;
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
