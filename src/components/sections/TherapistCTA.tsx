"use client";

import { useLang } from "@/context/i18n";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useAuthModal } from "@/lib/auth-modal";

export function TherapistCTA() {
  const { t } = useLang();
  const { openAuth } = useAuthModal();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl text-white p-10 lg:p-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center" style={{ background: "linear-gradient(135deg,var(--color-secondary) 0%,#1E4035 100%)" }}>
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 w-[440px] h-[440px] rounded-full bg-primary/25 blur-3xl blob-drift" />
            <div aria-hidden className="pointer-events-none absolute left-10 bottom-6 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <p className="eyebrow !text-primary mb-3">{t("landing.therapistCtaEyebrow")}</p>
              <h2 className="text-4xl font-display mb-4">{t("landing.therapistCtaTitle")}</h2>
              <p className="text-[#D1E8DF]/85 max-w-xl">{t("landing.therapistCtaDesc")}</p>
            </div>
            <div className="relative md:justify-self-end">
              <button onClick={() => openAuth("signup", "therapist")} className="btn-primary text-base">{t("common.applyToJoin")} <ArrowRight size={16} /></button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
