"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { useLang } from "@/context/i18n";
import { cn } from "@/lib/utils";
import { BookingVisual, RecoveryVisual, SearchVisual } from "./HowItWorksVisuals";

interface Step {
  n: string;
  t: string;
  d: string;
  cta?: string;
  href?: string;
}

interface HowItWorksStepsProps {
  steps?: Step[];
  variant?: "light" | "dark";
}

const VISUALS = [SearchVisual, BookingVisual, RecoveryVisual];

export function HowItWorksSteps({ steps: stepsProp, variant = "light" }: HowItWorksStepsProps) {
  const { t } = useLang();
  const dark = variant === "dark";
  const DEFAULT_STEPS: Step[] = [
    { n: t("landing.step1Number"), t: t("landing.step1Title"), d: t("landing.step1DescDefault"), cta: t("landing.step1Cta"), href: "/access" },
    { n: t("landing.step2Number"), t: t("landing.step2Title"), d: t("landing.step2DescDefault"), cta: t("landing.step2Cta"), href: "/find-a-therapist" },
    { n: t("landing.step3Number"), t: t("landing.step3Title"), d: t("landing.step3DescDefault"), cta: t("landing.step3Cta"), href: "/services" },
  ];
  const steps = stepsProp ?? DEFAULT_STEPS;
  return (
    <div className="space-y-24 lg:space-y-40">
      {steps.map((s, i) => {
        const Visual = VISUALS[i % VISUALS.length];
        const reversed = i % 2 === 1;
        return (
          <div
            key={s.n}
            className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20"
          >
            <Reveal className={cn(reversed ? "lg:order-2" : "lg:order-1")}>
              <Visual />
            </Reveal>
            <Reveal delay={120} className={cn(reversed ? "lg:order-1" : "lg:order-2")}>
              <div className={cn("max-w-[400px]", dark ? "text-white" : "text-text")}>
                <div className={cn("font-mono text-[11px] font-medium uppercase tracking-[0.22em]", dark ? "text-voltage-lime" : "text-secondary")}>
                  {s.n}
                </div>
                <h3
                  className="mt-4 font-sans font-medium tracking-[-0.02em]"
                  style={{ fontSize: "clamp(24px, 2.2vw, 32px)", lineHeight: 1.15 }}
                >
                  {s.t}
                </h3>
                <p className={cn("mt-4 text-[15px] leading-[1.6]", dark ? "text-ink-muted" : "text-text-light")}>{s.d}</p>
                {s.cta && s.href && (
                  <Link
                    href={s.href}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
                  >
                    {s.cta}
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
