"use client";

import { useLang } from "@/context/i18n";
import { Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { BookButton } from "@/components/BookButton";
import { Avatar } from "@/components/Avatar";
import { FeaturedTherapistsSkeleton } from "@/components/SuspenseFallback";
import type { Therapist } from "@/lib/types";

interface FeaturedTherapistsProps {
  therapists: Therapist[];
  onBook: (t: Therapist) => void;
  loading?: boolean;
}

const CARD_BG = [
  "linear-gradient(135deg, var(--color-moss) 0%, #008c47 100%)",
  "linear-gradient(135deg, var(--color-olive) 0%, #8a8500 100%)",
  "linear-gradient(135deg, #1B1B1B 0%, #3d3d3d 100%)",
];

export function FeaturedTherapists({ therapists, onBook, loading }: FeaturedTherapistsProps) {
  const { t } = useLang();
  return (
    <section id="therapists" className="relative py-24 overflow-hidden bg-carbon text-paper-bright">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-8 left-8 w-[380px] h-[380px] rounded-full bg-volt/20 blur-3xl blob-drift" />
        <div className="absolute bottom-0 right-8 w-[420px] h-[420px] rounded-full bg-mint/20 blur-3xl blob-float-b" />
      </div>
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="label-ink !text-volt mb-3">{t("landing.featuredTherapistsEyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-12 max-w-3xl">{t("landing.featuredTherapistsTitle")}</h2>
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
                    className="card-neo card-neo-hover group relative rounded-2xl overflow-hidden p-6 h-72 flex flex-col justify-between !bg-transparent border-2 border-paper-bright/30"
                    style={{ background: CARD_BG[i % CARD_BG.length] }}
                  >
                    <span className="chip-mint absolute right-4 top-4">{t("landing.nmcVerified")}</span>
                    <span aria-hidden className="absolute -right-4 -bottom-6 font-display font-extrabold text-[10rem] leading-none text-paper-bright/10 select-none">
                      {initials}
                    </span>
                    <div className="flex items-center gap-1 text-xs relative z-10">
                      <Star size={14} className="fill-volt text-volt" />
                      <span className="font-bold">{therapist.rating}</span>
                      <span className="text-paper-bright/70">({therapist.reviews} {t("landing.reviews")})</span>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={therapist.name} size={44} />
                        <div className="font-display font-bold text-2xl">{therapist.name}</div>
                      </div>
                      <div className="text-sm text-paper-bright/80 mb-4">{therapist.specialty} · {therapist.city}</div>
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
