"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useLang } from "@/context/i18n";
import { SPECIALTIES } from "@/constants";

const CHIPS = SPECIALTIES.slice(0, 4);

interface HeroSectionProps {
  onSearch?: (q: string, spec?: string) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [phText, setPhText] = useState("");
  const [phDeleting, setPhDeleting] = useState(false);

  const phrases = useMemo(
    () => [t("landing.heroSearchPhrase1"), t("landing.heroSearchPhrase2"), t("landing.heroSearchPhrase3")],
    [lang],
  );

  useEffect(() => {
    const word = phrases[phIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!phDeleting) {
      if (phText.length < word.length) {
        timeout = setTimeout(() => setPhText(word.slice(0, phText.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setPhDeleting(true), 1800);
      }
    } else if (phText.length > 0) {
      timeout = setTimeout(() => setPhText(word.slice(0, phText.length - 1)), 30);
    } else {
      setPhDeleting(false);
      setPhIndex((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [phText, phDeleting, phIndex, phrases]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query) onSearch?.(query);
  };

  const chip = (value: string) => {
    setQ(value);
    onSearch?.(value, value);
  };

  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-white"
      style={{
        background:
          "linear-gradient(180deg, var(--color-abyss-soft) 0%, var(--color-abyss-mid) 55%, var(--color-abyss-deep) 80%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 85% 75% at 55% 40%, var(--color-cyan-spark) 0%, var(--color-voltage-lime) 60%, transparent 78%)`,
            filter: "blur(70px)",
            opacity: 0.5,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 lg:px-8 flex flex-col items-center text-center">
        <h1
          className="font-display font-bold uppercase text-white"
          style={{
            fontSize: "clamp(44px, 7vw, 128px)",
            lineHeight: 0.85,
            letterSpacing: "-0.02em",
          }}
        >
          {t("landing.heroTitle")}
        </h1>

        <p className="hidden md:block mt-6 max-w-2xl text-base text-white/70">
          {t("landing.heroDesc")}
        </p>

        <div className="mt-10 w-full max-w-[680px]">
          <form
            onSubmit={submit}
            className="flex items-center gap-3 rounded-3xl bg-white px-5 py-6 sm:px-6 sm:py-4"
          >
            <Search size={24} className="shrink-0 text-black/50 sm:size-5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={phText}
              className="flex-1 min-w-0 bg-transparent text-base text-black placeholder:text-black/50 outline-none sm:text-[15px]"
              aria-label={t("landing.heroSearchPlaceholder")}
            />
            <button
              type="submit"
              aria-label={t("landing.heroSearchSubmit")}
              className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 sm:w-10 sm:h-10"
              style={{ background: "var(--color-voltage-lime)", color: "var(--color-carbon-ink)" }}
            >
              <ArrowRight size={22} strokeWidth={2.5} className="sm:size-5" />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => chip(c)}
                className="text-[12px] text-white border border-white/30 rounded-full px-3.5 py-2 sm:px-4 sm:py-1.5 sm:text-[14px] transition-colors hover:bg-voltage-lime hover:text-carbon-ink"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
