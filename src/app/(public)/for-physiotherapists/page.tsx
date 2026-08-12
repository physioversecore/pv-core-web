"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { CalendarClock, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { SignupFlow } from "@/components/auth/SignupFlow";
import type { Role } from "@/types";

const BENEFITS = [
  { icon: <CalendarClock size={40} strokeWidth={1.5} />, titleKey: "benefit1Title", descKey: "benefit1Desc", dark: true },
  { icon: <Wallet size={40} strokeWidth={1.5} />, titleKey: "benefit2Title", descKey: "benefit2Desc", dark: false },
  { icon: <TrendingUp size={40} strokeWidth={1.5} />, titleKey: "benefit3Title", descKey: "benefit3Desc", dark: false },
] as const;

export default function ForPhysiotherapists() {
  const { t } = useLang();
  const router = useRouter();

  const scrollToEnroll = useCallback(() => {
    const el = document.getElementById("enroll");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (window.location.hash === "#enroll") {
      const t = window.setTimeout(scrollToEnroll, 100);
      return () => window.clearTimeout(t);
    }
  }, [scrollToEnroll]);

  const handleSuccess = (role: Role) => {
    if (role === "therapist") {
      router.replace("/login");
    } else {
      router.replace("/patient");
    }
  };

  return (
    <main className="bg-moss text-white">
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pt-20 md:pt-24 pb-16 text-center">
        <Reveal className="pt-8 md:pt-4">
          <p className="label-ink !text-volt mb-4">{t("forTherapists.eyebrow")}</p>
          <h1 className="text-5xl md:text-7xl lg:text-[88px] font-display font-extrabold uppercase tracking-tighter leading-[0.95] text-volt mb-6">
            {t("forTherapists.joinTheNetwork")}
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
            {t("forTherapists.subtitle")}
          </p>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-16">
        <div className="card-neo !shadow-[5px_5px_0_var(--color-carbon-soft)] bg-paper-bright text-carbon p-8 md:p-12 mb-16">
          <p className="label-ink mb-3">{t("forTherapists.introTitle")}</p>
          <p className="text-text-light max-w-3xl">{t("forTherapists.introBody1")}</p>
          <p className="text-text-light max-w-3xl mt-4">{t("forTherapists.introBody2")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.titleKey} delay={i * 80}>
              <div
                className={`rounded-2xl border-2 border-carbon-soft p-8 aspect-[4/3] flex flex-col justify-between group hover:-translate-y-0.5 hover:rotate-1 transition-transform duration-300 ${
                  b.dark ? "bg-carbon text-paper-bright shadow-[6px_6px_0_var(--color-volt)]" : "bg-volt text-carbon shadow-[4px_4px_0_var(--color-carbon-soft)]"
                }`}
              >
                <div className={b.dark ? "text-volt group-hover:scale-110 transition-transform duration-300" : "text-carbon group-hover:scale-110 transition-transform duration-300"}>
                  {b.icon}
                </div>
                <div>
                  <h3 className={`font-display font-bold text-2xl uppercase tracking-tight mb-2 ${b.dark ? "text-paper-bright" : "text-carbon"}`}>
                    {t(`forTherapists.${b.titleKey}`)}
                  </h3>
                  <p className={b.dark ? "text-paper-bright/70" : "text-carbon/70"}>{t(`forTherapists.${b.descKey}`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-carbon rounded-t-[40px] md:rounded-t-[64px] px-5 lg:px-8 pt-16 md:pt-24 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter text-paper-bright leading-tight mb-6">
                {t("forTherapists.readyTitle")}
              </h2>
              <p className="text-paper-bright/80 text-lg mb-10">{t("forTherapists.readyDesc")}</p>
              <button onClick={scrollToEnroll} className="inline-flex items-center gap-2 bg-volt text-carbon font-mono font-bold uppercase text-sm tracking-wide px-8 py-4 rounded-full border-2 border-carbon-soft shadow-[1px_1px_0_var(--color-carbon-soft)] hover:bg-paper-bright hover:-translate-y-px transition-transform cursor-pointer">
                {t("forTherapists.applyNow")}
                <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div id="enroll" className="scroll-mt-24 bg-paper-bright text-carbon rounded-[32px] border-2 border-carbon-soft shadow-[10px_10px_0_var(--color-volt)] p-8 md:p-12">
              <SignupFlow defaultSignupRole="therapist" onSuccess={handleSuccess} isSignUpPage={false} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
