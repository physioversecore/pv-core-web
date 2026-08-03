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
    { n: t("howItWorks.step1Number"), t: t("howItWorks.step1Title"), d: t("howItWorks.step1Desc") },
    { n: t("howItWorks.step2Number"), t: t("howItWorks.step2Title"), d: t("howItWorks.step2Desc") },
    { n: t("howItWorks.step3Number"), t: t("howItWorks.step3Title"), d: t("howItWorks.step3Desc") },
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <HowItWorksSteps steps={STEPS} />
        </div>
      </section>

      <section className="py-16 bg-surface/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">{t("howItWorks.promiseEyebrow")}</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">{t("howItWorks.promiseTitle")}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.title} delay={i * 80}>
                <div className="card-soft p-6">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary" style={{ background: "#D1E8DF" }}>{g.icon}</div>
                  <div className="font-display text-lg mb-1">{g.title}</div>
                  <p className="text-text-light text-sm">{g.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">{t("howItWorks.ctaTitle")}</h2>
          <p className="text-text-light mb-6">{t("howItWorks.ctaDesc")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/find-a-therapist" className="btn-primary">{t("howItWorks.ctaFind")}</Link>
            <Link href="/services" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">{t("howItWorks.ctaServices")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
