"use client";

import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

export function HowItWorksSection() {
  const { t } = useLang();
  return (
    <section id="how" className="py-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow !text-white/50 mb-3">{t("landing.howItWorksEyebrow")}</p>
          <h2 className="text-4xl font-display mb-12 max-w-2xl">{t("landing.howItWorksTitle")}</h2>
        </Reveal>
        <HowItWorksSteps variant="dark" />
      </div>
    </section>
  );
}
