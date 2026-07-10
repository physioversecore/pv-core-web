"use client";

import { useLang } from "@/context/i18n";
import { Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Reveal } from "@/components/Reveal";
import { HeroStat } from "@/components/HeroStat";
import { BookButton } from "@/components/BookButton";
import { AppStoreBadge } from "@/components/AppStoreBadge";
import { useAuthModal } from "@/lib/auth-modal";
import { npr } from "@/lib/cart";
import type { Therapist } from "@/lib/types";

interface HeroSectionProps {
  therapists: Therapist[];
  onBook: (t: Therapist) => void;
}

export function HeroSection({ therapists, onBook }: HeroSectionProps) {
  const { t } = useLang();
  const { openAuth } = useAuthModal();

  return (
    <section id="top" className="relative min-h-screen overflow-hidden text-white bg-background-dark">
      <div aria-hidden className="absolute inset-0 hero-gradient-bg" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-24 -left-20 w-[420px] h-[420px] rounded-full bg-secondary/40 blur-3xl blob-float-a" />
        <div className="absolute top-1/3 -right-24 w-[440px] h-[440px] rounded-full bg-primary/25 blur-3xl blob-float-b" />
        <div className="absolute bottom-10 left-1/3 w-[360px] h-[360px] rounded-full bg-primary-light/15 blur-3xl blob-float-c" />
      </div>
      <div aria-hidden className="absolute inset-0 grain-overlay" />

      <svg aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ bottom: "18%", height: "90px", width: "100%" }} viewBox="0 0 1200 90" preserveAspectRatio="none">
        <path d="M0 45 L280 45 L300 45 L310 20 L322 70 L332 15 L344 65 L356 45 L1200 45" fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <Reveal>
          <p className="eyebrow !text-white/70 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary dot-pulse inline-block" />
            {t("landing.heroBadge")}
          </p>
          <h1 className="font-display leading-[1.02] mb-5" style={{ fontSize: "clamp(2.5rem, 5.4vw, 3.65rem)" }}>
            {t("landing.heroTitle")}
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-7">
            {t("landing.heroDesc")}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => onBook(therapists[0])} className="btn-primary">{t("landing.heroCta")}</button>
            <button onClick={() => openAuth("signup")} className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-white/40 text-white hover:bg-white/10 transition">
              {t("common.becomeTherapist")}
            </button>
          </div>
          <div className="flex flex-wrap gap-3 mb-10">
            <AppStoreBadge platform="google" variant="hero" />
            <AppStoreBadge platform="apple" variant="hero" />
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <HeroStat value="180+" label={t("landing.heroStatTherapists")} />
            <HeroStat value="4.8★" label={t("landing.heroStatRating")} />
            <HeroStat value="6" label={t("landing.heroStatCities")} />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative rounded-[22px] p-6 lg:p-7 border border-white/15" style={{ background: "rgba(251,251,248,0.07)", backdropFilter: "blur(18px)" }}>
            <div className="absolute -top-3 left-6 chip !bg-primary !text-white">{t("landing.heroLiveNow")}</div>
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg text-white">{t("landing.heroAvailableToday")}</div>
              <div className="text-xs text-white/60">{t("landing.heroRegion")}</div>
            </div>
            <div className="space-y-3">
              {therapists.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Avatar name={t.name} size={42} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-white">{t.name}</div>
                    <div className="text-xs text-white/60 truncate">{t.specialty}</div>
                    <div className="flex items-center gap-1 text-xs text-white/60 mt-0.5">
                      <Star size={11} className="fill-primary text-primary" /> {t.rating}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white">{npr(t.price)}</div>
                    <BookButton onClick={() => onBook(t)} size="sm" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* <div aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="font-mono text-[10px] uppercase tracking-widest">Scroll</span>
        <span className="w-px h-8 bg-white/50 scroll-cue origin-top" />
      </div> */}
    </section>
  );
}
