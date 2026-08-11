"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { HeroStat } from "@/components/HeroStat";
import { HeroFindTherapist } from "@/components/sections/HeroFindTherapist";
import type { Therapist } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

interface HeroSectionProps {
  loading?: boolean;
  q: string;
  city: string;
  spec: string;
  gender: string;
  filtered: Therapist[];
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
}

export function HeroSection({
  loading,
  q, city, spec, gender, filtered,
  onQChange, onCityChange, onSpecChange, onGenderChange,
}: HeroSectionProps) {
  const { t } = useLang();

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-moss text-white grid-bg">
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#1b1b1b 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-36 md:pt-44 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <Reveal className="lg:col-span-7">
          <p className="label-ink !text-volt mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-volt dot-pulse inline-block" />
            {t("landing.heroBadge")}
          </p>
          <h1 className="font-display font-extrabold uppercase leading-[0.85] tracking-tighter mb-6" style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}>
            {t("landing.heroTitle")}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-8">
            {t("landing.heroDesc")}
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/services" className="mt-1 inline-flex items-center gap-1 btn-volt uppercase">{t("landing.heroSecondaryCta")}<ArrowUpRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            <HeroStat value="180+" label={t("landing.heroStatTherapists")} />
            <HeroStat value="4.8★" label={t("landing.heroStatRating")} />
            <HeroStat value="6" label={t("landing.heroStatCities")} />
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5">
          <HeroFindTherapist
            q={q}
            city={city}
            spec={spec}
            gender={gender}
            filtered={filtered}
            loading={loading}
            onQChange={onQChange}
            onCityChange={onCityChange}
            onSpecChange={onSpecChange}
            onGenderChange={onGenderChange}
          />
        </Reveal>
      </div>
    </section>
  );
}
