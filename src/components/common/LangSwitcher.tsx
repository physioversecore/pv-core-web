"use client";

import { useLang } from "@/context/i18n";

export function LangSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  const base = "px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition";
  return (
    <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-full border ${dark ? "border-carbon bg-white/10" : "border-carbon bg-paper-bright"}`}>
      <button onClick={() => setLang("en")} className={`${base} ${lang === "en" ? (dark ? "bg-white text-moss" : "bg-carbon text-white") : dark ? "text-white/70" : "text-text-light"}`}>EN</button>
      <button onClick={() => setLang("ne")} className={`${base} ${lang === "ne" ? (dark ? "bg-white text-moss" : "bg-carbon text-white") : dark ? "text-white/70" : "text-text-light"}`}>नेपा</button>
    </div>
  );
}
