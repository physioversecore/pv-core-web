"use client";

import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

export function HowItWorksSection() {
  const { t } = useLang();
  return (
    <section id="how" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
            <p className="eyebrow !text-white/50 mb-0">{t("landing.howItWorksEyebrow")}</p>
          </div>
          <h2
            className="font-sans font-medium tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
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
