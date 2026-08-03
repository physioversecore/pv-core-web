"use client";

import { useLang } from "@/context/i18n";
import { Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { BookButton } from "@/components/BookButton";
import { FeaturedTherapistsSkeleton } from "@/components/SuspenseFallback";
import type { Therapist } from "@/lib/types";

interface FeaturedTherapistsProps {
  therapists: Therapist[];
  onBook: (t: Therapist) => void;
  loading?: boolean;
}

const GRADIENTS = [
  "linear-gradient(135deg, var(--color-secondary) 0%, #3F7965 100%)",
  "linear-gradient(135deg, var(--color-primary) 0%, #F4C778 100%)",
  "linear-gradient(135deg, #7A3535 0%, #C97070 100%)",
];

export function FeaturedTherapists({ therapists, onBook, loading }: FeaturedTherapistsProps) {
  const { t } = useLang();
  return (
    <section id="therapists" className="relative py-24 overflow-hidden text-background bg-background-dark">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 left-8 w-[380px] h-[380px] rounded-full bg-primary/25 blur-3xl blob-drift" />
        <div className="absolute bottom-0 right-8 w-[420px] h-[420px] rounded-full bg-secondary/45 blur-3xl blob-float-b" />
      </div>
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow !text-primary mb-3">{t("landing.featuredTherapistsEyebrow")}</p>
          <h2 className="text-4xl font-display mb-12 max-w-2xl">{t("landing.featuredTherapistsTitle")}</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full"><FeaturedTherapistsSkeleton /></div>
          ) : (
            therapists.map((therapist, i) => {
  const initials = therapist.name.replace("Dr. ", "").split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <Reveal key={therapist.id} delay={i * 120}>
      <div
        className="group relative rounded-3xl overflow-hidden p-6 h-72 flex flex-col justify-between border border-white/10 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_20px_50px_-15px_rgba(226,150,47,0.55)]"
        style={{ background: GRADIENTS[i % GRADIENTS.length] }}
      >
        <span className="absolute right-4 top-4 chip !bg-white/95 !text-secondary">{t("landing.nmcVerified")}</span>
        <span className="absolute -right-4 -bottom-6 font-display text-[10rem] leading-none text-white/10 select-none">
          {initials}
        </span>
        <div className="flex items-center gap-1 text-xs relative z-10">
          <Star size={14} className="fill-primary text-primary" />
          <span className="font-semibold">{therapist.rating}</span>
          <span className="text-white/70">({therapist.reviews} {t("landing.reviews")})</span>
        </div>
        <div className="relative z-10">
          <div className="font-display text-2xl">{therapist.name}</div>
          <div className="text-sm text-white/80 mb-4">{therapist.specialty} · {therapist.city}</div>
          <BookButton onClick={() => onBook(therapist)} size="sm" />
        </div>
      </div>
    </Reveal>
  );
}))}
        </div>
      </div>
    </section>
  );
}
