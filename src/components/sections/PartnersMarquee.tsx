"use client";

import { useLang } from "@/context/i18n";
import { partners } from "@/lib/landing-data";

export function PartnersMarquee() {
  const { t } = useLang();
  return (
    <section aria-label={t("landing.partnersTitle")} className="pt-16 pb-14 sm:pt-20 sm:pb-16">
      <div className="w-full lg:mx-6 px-5 lg:px-8">
        <p className="flex items-center justify-center gap-1.5 lg:justify-start font-sans text-xs font-semibold tracking-[0.08em] uppercase text-white">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-voltage-lime/70" />
          {t("landing.partnersTitle")}
        </p>
      </div>

      <div className="marquee mt-5 sm:mt-6">
        <div className="marquee-track">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-stretch gap-3 pr-3 sm:gap-3.5 sm:pr-3.5">
              {[...partners, ...partners].map((p, i) => (
                <div
                  key={`${p.name}-${half}-${i}`}
                  className="partner-logo-card"
                  title={p.name}
                >
                  <span aria-hidden className="partner-logo-mark">
                    {p.icon}
                  </span>
                  <span className="partner-logo-name">{p.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
