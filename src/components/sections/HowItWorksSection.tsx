"use client";

import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

export function HowItWorksSection() {
  const { t } = useLang();
  return (
    <section id="how" className="bg-paper py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="label-ink mb-3">{t("landing.howItWorksEyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-12 max-w-3xl">{t("landing.howItWorksTitle")}</h2>
        </Reveal>
        <HowItWorksSteps />
      </div>
    </section>
  );
}
