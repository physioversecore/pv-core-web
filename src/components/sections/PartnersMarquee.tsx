"use client";

import { useLang } from "@/context/i18n";
import { partners } from "@/lib/landing-data";

export function PartnersMarquee() {
  const { t } = useLang();
  return (
    <section aria-label="Trusted by" className="bg-background-dark">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8">
        <p className="text-center eyebrow !text-white/50">{t("landing.partnersTitle")}</p>
      </div>
      <div className="marquee py-6">
        <div className="marquee-track font-display text-base text-white/60">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex items-center gap-12 pr-12 shrink-0">
              {partners.map((s) => (
                <span key={s.name + dup} className="flex items-center gap-2 whitespace-nowrap">
                  <span>{s.icon}</span> {s.name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
