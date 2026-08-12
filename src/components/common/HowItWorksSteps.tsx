"use client";

import { Search, CreditCard, Home } from "lucide-react";
import { Reveal } from "./Reveal";
import { useLang } from "@/context/i18n";

interface Step {
  n: string;
  t: string;
  d: string;
}

interface HowItWorksStepsProps {
  steps?: Step[];
}

const ICONS = [Search, CreditCard, Home];

export function HowItWorksSteps({ steps: stepsProp }: HowItWorksStepsProps) {
  const { t } = useLang();
  const DEFAULT_STEPS: Step[] = [
    { n: t("landing.step1Number"), t: t("landing.step1Title"), d: t("landing.step1DescDefault") },
    { n: t("landing.step2Number"), t: t("landing.step2Title"), d: t("landing.step2DescDefault") },
    { n: t("landing.step3Number"), t: t("landing.step3Title"), d: t("landing.step3DescDefault") },
  ];
  const steps = stepsProp ?? DEFAULT_STEPS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {steps.map((s, i) => {
        const Icon = ICONS[i] ?? Search;

        if (i === 0) {
          return (
            <Reveal key={s.n} className="md:col-span-12">
              <article className="card-neo overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between order-2 md:order-1">
                  <span className="label-ink text-olive">{s.n}</span>
                  <div className="mt-8">
                    <h3 className="font-display font-extrabold uppercase text-2xl md:text-4xl tracking-tighter text-carbon mb-4">{s.t}</h3>
                    <p className="text-text-light text-sm leading-relaxed max-w-md">{s.d}</p>
                  </div>
                </div>
                <div className="md:w-1/2 h-48 md:h-auto order-1 md:order-2 relative bg-mint grid-bg overflow-hidden">
                  <span aria-hidden className="absolute font-display font-extrabold uppercase leading-none text-carbon/10 select-none text-[7rem] md:text-[9rem] -right-3 -bottom-8">
                    0{i + 1}
                  </span>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-volt border-2 border-carbon-soft grid place-items-center shadow-[4px_4px_0_var(--color-carbon-soft)]">
                        <Icon size={40} strokeWidth={2} className="text-carbon" />
                      </div>
                      <span className="absolute -right-10 -top-2 w-7 h-7 rounded-full bg-paper-bright border-2 border-carbon-soft shadow-[1px_1px_0_var(--color-carbon-soft)]" />
                      <span className="absolute -left-9 bottom-2 w-5 h-5 rounded-full bg-carbon" />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        }

        return (
          <Reveal key={s.n} className="md:col-span-6" delay={i * 120}>
            <article className="card-neo h-full p-6 md:p-10 flex flex-col justify-between min-h-[340px]">
              <span className="label-ink text-olive">{s.n}</span>
              <div className="mt-auto pt-10">
                <div
                  className={`w-16 h-16 rounded-full border-2 border-carbon-soft grid place-items-center mb-6 shadow-[3px_3px_0_var(--color-carbon-soft)] ${
                    i === 1 ? "bg-volt" : "bg-mint"
                  }`}
                >
                  <Icon size={28} className="text-carbon" />
                </div>
                <h3 className="font-display font-extrabold uppercase text-2xl tracking-tighter text-carbon mb-3">{s.t}</h3>
                <p className="text-text-light text-sm leading-relaxed">{s.d}</p>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
