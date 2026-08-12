"use client";

import { cloneElement, type ReactElement } from "react";
import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { Reveal } from "@/components/Reveal";
import { CalendarClock, CreditCard, Home, ShieldCheck, Star, ClipboardList, ArrowUpRight, type LucideProps } from "lucide-react";

function GuaranteeCard({ icon, title, desc, index }: { icon: ReactElement<LucideProps>; title: string; desc: string; index: number }) {
  const bigIcon = cloneElement(icon, { size: 40, strokeWidth: 2 });

  if (index === 0) {
    return (
      <Reveal className="md:col-span-12">
        <div className="card-neo card-neo-hover overflow-hidden flex flex-col md:flex-row h-full group">
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between order-2 md:order-1">
            <div className="w-12 h-12 rounded-xl grid place-items-center text-carbon bg-volt border-2 border-carbon-soft group-hover:scale-110 group-hover:rotate-6 transition duration-300">{icon}</div>
            <div className="mt-8">
              <h3 className="font-display font-extrabold uppercase text-2xl md:text-4xl tracking-tighter text-carbon mb-4">{title}</h3>
              <p className="text-text-light text-sm leading-relaxed max-w-md">{desc}</p>
            </div>
          </div>
          <div className="md:w-1/2 h-48 md:h-auto order-1 md:order-2 relative bg-mint grid-bg overflow-hidden">
            <span aria-hidden className="absolute font-display font-extrabold uppercase leading-none text-carbon/10 select-none text-[7rem] md:text-[9rem] -right-3 -bottom-8">
              0{index + 1}
            </span>
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-volt border-2 border-carbon-soft grid place-items-center shadow-[4px_4px_0_var(--color-carbon-soft)]">
                  {bigIcon}
                </div>
                <span className="absolute -right-10 -top-2 w-7 h-7 rounded-full bg-paper-bright border-2 border-carbon-soft shadow-[1px_1px_0_var(--color-carbon-soft)]" />
                <span className="absolute -left-9 bottom-2 w-5 h-5 rounded-full bg-carbon" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className="md:col-span-6 lg:col-span-4" delay={index * 80}>
      <div className="card-neo card-neo-hover p-6 h-full">
        <div className="w-12 h-12 rounded-xl grid place-items-center mb-3 text-carbon bg-volt border-2 border-carbon-soft">{icon}</div>
        <div className="font-display font-bold text-lg mb-1">{title}</div>
        <p className="text-text-light text-sm">{desc}</p>
      </div>
    </Reveal>
  );
}

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
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <HowItWorksSteps steps={STEPS} />
        </div>
      </section>

      <section className="py-16 md:py-20 bg-moss grid-bg">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="label-ink mb-3 text-volt">{t("howItWorks.promiseEyebrow")}</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase text-paper-bright tracking-tighter mb-10 max-w-2xl">{t("howItWorks.promiseTitle")}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {GUARANTEES.map((g, i) => (
              <GuaranteeCard key={g.title} icon={g.icon} title={g.title} desc={g.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-paper">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-4xl uppercase tracking-tighter mb-2">{t("howItWorks.ctaTitle")}</h2>
          <p className="text-text-light mb-8">{t("howItWorks.ctaDesc")}</p>
            <Link href="/find-a-therapist" className="btn-volt inline-flex item-center gap-1">{t("howItWorks.ctaFind")} <ArrowUpRight size={16}/> </Link>
        </div>
      </section>
    </PageShell>
  );
}
