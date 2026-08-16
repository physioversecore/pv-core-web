"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { Reveal } from "@/components/Reveal";
import { CalendarClock, CreditCard, Home, ShieldCheck, Star, ClipboardList } from "lucide-react";

export default function HowItWorks() {
  const { t } = useLang();

  const STEPS = [
    { n: t("howItWorks.step1Number"), t: t("howItWorks.step1Title"), d: t("howItWorks.step1Desc"), cta: t("howItWorks.step1Cta"), href: "/signup" },
    { n: t("howItWorks.step2Number"), t: t("howItWorks.step2Title"), d: t("howItWorks.step2Desc"), cta: t("howItWorks.step2Cta"), href: "/find-a-therapist" },
    { n: t("howItWorks.step3Number"), t: t("howItWorks.step3Title"), d: t("howItWorks.step3Desc"), cta: t("howItWorks.step3Cta"), href: "/services" },
  ];

  const GUARANTEES = [
    { icon: <ShieldCheck />, title: t("howItWorks.guarantee1Title"), desc: t("howItWorks.guarantee1Desc") },
    { icon: <CalendarClock />, title: t("howItWorks.guarantee2Title"), desc: t("howItWorks.guarantee2Desc") },
    { icon: <CreditCard />, title: t("howItWorks.guarantee3Title"), desc: t("howItWorks.guarantee3Desc") },
    { icon: <ClipboardList />, title: t("howItWorks.guarantee4Title"), desc: t("howItWorks.guarantee4Desc") },
    { icon: <Home />, title: t("howItWorks.guarantee5Title"), desc: t("howItWorks.guarantee5Desc") },
    { icon: <Star />, title: t("howItWorks.guarantee6Title"), desc: t("howItWorks.guarantee6Desc") },
  ];

  return (
    <PageShell
      eyebrow={t("howItWorks.eyebrow")}
      title={t("howItWorks.title")}
      subtitle={t("howItWorks.subtitle")}
    >
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <HowItWorksSteps steps={STEPS} />
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
              <p className="eyebrow mb-0">{t("howItWorks.promiseEyebrow")}</p>
            </div>
            <h2
              className="font-sans font-medium tracking-[-0.02em] text-text"
              style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
            >
              {t("howItWorks.promiseTitle")}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.title} delay={i * 80}>
                <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-white">
                  <div className={`feature-visual feature-visual-${["a", "b", "c"][i % 3]}`} style={{ aspectRatio: "16 / 9" }}>
                    <div className="feature-visual-grid" aria-hidden />
                    <div className="relative z-10 grid h-full place-items-center">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-secondary shadow-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                        {g.icon}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-[15px] font-semibold tracking-[-0.01em] text-text">{g.title}</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-text-light">{g.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
