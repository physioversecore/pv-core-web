import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ne";
const KEY = "sahayatri.lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

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
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function LangSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  const base = "px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition";
  return (
    <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-full border ${dark ? "border-white/20 bg-white/10" : "border-border bg-white"}`}>
      <button onClick={() => setLang("en")} className={`${base} ${lang === "en" ? (dark ? "bg-white text-secondary" : "bg-secondary text-white") : dark ? "text-white/70" : "text-text-light"}`}>EN</button>
      <button onClick={() => setLang("ne")} className={`${base} ${lang === "ne" ? (dark ? "bg-white text-secondary" : "bg-secondary text-white") : dark ? "text-white/70" : "text-text-light"}`}>नेपा</button>
    </div>
  );
}
