"use client";

import { useLang } from "@/context/i18n";
import { Reveal, CountUp } from "@/components/Reveal";
import { PlusField } from "@/components/PlusField";
import { impactStats } from "@/lib/landing-data";

export function ImpactStats() {
  const { t } = useLang();
  return (
    <section className="relative py-16 md:py-24 bg-moss grid-bg">
      <PlusField count={10} seed={3} />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {impactStats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card-neo card-neo-hover p-8 md:p-10 text-center">
                <div className="font-display font-extrabold text-4xl lg:text-5xl text-carbon">
                  {s.isRating
                    ? <>4.8<span className="text-olive">★</span></>
                    : <><CountUp to={s.value} /><span className="text-olive">{s.suffix}</span></>}
                </div>
                <div className="label-ink text-text-light mt-3">
                  {s.isRating ? t("landing.impactStatsRating") : s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
