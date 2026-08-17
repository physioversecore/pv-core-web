"use client";

import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

export function HowItWorksSection() {
  const { t } = useLang();
  return (
    <section id="how" className="py-18 lg:py-22">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
            <p className="eyebrow !text-white/50 mb-0">{t("landing.howItWorksEyebrow")}</p>
          </div>
          <h2
            className="font-display text-heading-sm sm:text-heading-lg font-medium leading-snug tracking-[-0.02em] text-white"
          >
            {t("landing.howItWorksTitle")}
          </h2>
        </Reveal>
        <div className="mt-20 lg:mt-28">
          <HowItWorksSteps variant="dark" />
        </div>
      </div>
    </section>
  );
}
