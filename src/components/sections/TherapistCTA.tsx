"use client";

import { useLang } from "@/context/i18n";
import { ArrowRight, Calendar, Check, Star, Wallet } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";
import { useAuthModal } from "@/lib/auth-modal";
import { VisualFrame, VISUAL_CARD } from "@/components/common/HowItWorksVisuals";

function EarningsVisual() {
  const bars = [42, 58, 46, 74, 62, 92, 78];
  return (
    <div className="relative">
      <VisualFrame tone="b">
        <div className={VISUAL_CARD}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-light">
                <Wallet size={12} className="text-secondary" />
                This week
              </div>
              <div className="mt-1 text-xl font-semibold tracking-[-0.02em] text-text">Rs 18,500</div>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-white">+12%</span>
          </div>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-md ${i === 5 ? "bg-voltage-lime" : "bg-surface"}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text">
              <Calendar size={12} className="text-secondary" />
              Next visit · Baneshwor
            </span>
            <span className="text-[11.5px] text-text-light">3:00 PM</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-text">
              <Star size={12} className="fill-secondary text-secondary" />
              4.9 · 34 sessions
            </span>
            <span className="text-[11px] text-text-light">Verified · NMC</span>
          </div>
        </div>
      </VisualFrame>
      <div className="absolute bottom-4 left-4 z-20 chat-float hidden items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xl ring-1 ring-black/5 sm:flex">
        <Avatar name="Sita Lama" size={22} />
        <span className="text-[11px] font-semibold text-text">Booking confirmed</span>
        <Check size={11} className="text-secondary" />
      </div>
    </div>
  );
}

export function TherapistCTA() {
  const { t } = useLang();
  const { openAuth } = useAuthModal();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
          <Reveal className="lg:order-1">
            <div className="max-w-[440px]">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
                <p className="eyebrow !text-voltage-lime mb-0">{t("landing.therapistCtaEyebrow")}</p>
              </div>
              <h2
                className="font-sans font-medium tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
              >
                {t("landing.therapistCtaTitle")}
              </h2>
              <p className="mt-4 max-w-[400px] text-[15px] leading-[1.6] text-ink-muted">{t("landing.therapistCtaDesc")}</p>
              <button
                onClick={() => openAuth("signup", "therapist")}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
              >
                {t("common.applyToJoin")}
                <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:order-2">
            <EarningsVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
