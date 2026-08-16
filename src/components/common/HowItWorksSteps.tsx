"use client";

import { Reveal } from "./Reveal";
import { useLang } from "@/context/i18n";

interface Step {
  n: string;
  t: string;
  d: string;
}

interface HowItWorksStepsProps {
  steps?: Step[];
  variant?: "light" | "dark";
}

export function HowItWorksSteps({ steps: stepsProp, variant = "light" }: HowItWorksStepsProps) {
  const { t } = useLang();
  const dark = variant === "dark";
  const DEFAULT_STEPS: Step[] = [
    { n: t("landing.step1Number"), t: t("landing.step1Title"), d: t("landing.step1DescDefault") },
    { n: t("landing.step2Number"), t: t("landing.step2Title"), d: t("landing.step2DescDefault") },
    { n: t("landing.step3Number"), t: t("landing.step3Title"), d: t("landing.step3DescDefault") },
  ];
  const steps = stepsProp ?? DEFAULT_STEPS;
  return (
    <div className="relative">
      <svg
        aria-hidden
        className="hidden md:block absolute left-0 right-0 top-14 pointer-events-none"
        height="2"
        width="100%"
        preserveAspectRatio="none"
      >
        <line
          x1="12%"
          x2="88%"
          y1="1"
          y2="1"
          stroke={dark ? "var(--color-voltage-lime)" : "var(--color-secondary)"}
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
      </svg>
      <div className="relative grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className={`${dark ? "card-glass" : "card-soft"} p-6 hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300`}>
              <div className={`w-10 h-10 rounded-full grid place-items-center font-mono text-sm mb-4 ${dark ? "bg-voltage-lime text-carbon-ink" : "bg-secondary text-white"}`}>
                {s.n}
              </div>
              <div className="font-display text-xl mb-2">{s.t}</div>
              <p className={`text-sm ${dark ? "text-white/60" : "text-text-light"}`}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
