"use client";

import { useLang } from "@/context/i18n";
import { FileText, MessageCircle, Bell } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { AppStoreBadge } from "@/components/AppStoreBadge";

export function AppDownloadSection() {
  const { t } = useLang();
  return (
    <section id="app" className="py-20 md:py-28 text-white relative overflow-hidden bg-carbon">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-volt/15 blur-3xl blob-drift" />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <Reveal>
          <p className="label-ink !text-volt mb-3">{t("app.eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-6">{t("app.title")}</h2>
          <ul className="space-y-4 mb-8 text-paper-bright/85">
            <li className="flex items-center gap-3">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-volt text-carbon border-2 border-carbon"><FileText size={18} /></span>
              {t("app.feature1")}
            </li>
            <li className="flex items-center gap-3">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-mint text-carbon border-2 border-carbon"><MessageCircle size={18} /></span>
              {t("app.feature2")}
            </li>
            <li className="flex items-center gap-3">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-paper-bright text-carbon border-2 border-carbon"><Bell size={18} /></span>
              {t("app.feature3")}
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <AppStoreBadge platform="google" variant="section" />
            <AppStoreBadge platform="apple" variant="section" />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mx-auto w-[280px] h-[560px] rounded-[2.5rem] bg-carbon border-2 border-paper-bright shadow-[8px_8px_0_var(--color-volt)] phone-float">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-carbon rounded-b-2xl border-b-2 border-paper-bright/30" />
            <div className="absolute inset-2 rounded-[2rem] bg-paper text-carbon p-4 flex flex-col gap-3 overflow-hidden">
              <div className="text-[11px] font-mono font-bold text-text-light flex justify-between">
                <span>9:41</span><span>Sahayatri</span>
              </div>
              <div className="card-neo p-3 chat-float" style={{ animationDelay: "0.6s" }}>
                <div className="text-xs text-text-light">Today&apos;s session</div>
                <div className="font-display font-bold text-base leading-tight">Dr. Aarati Shrestha</div>
                <div className="text-[11px] text-text-light">Knee rehab · 10:00 AM</div>
                <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden border border-carbon">
                  <div className="h-full bg-moss progress-fill" />
                </div>
                <div className="text-[10px] text-text-light mt-1">Session 6 of 10</div>
              </div>
              <div className="rounded-xl bg-moss text-white p-3 chat-float border-2 border-carbon shadow-[3px_3px_0_var(--color-carbon)]" style={{ animationDelay: "1.2s" }}>
                <div className="text-[11px] opacity-70">Next visit</div>
                <div className="font-display font-bold text-base">Fri, Jul 5 · 4:00 PM</div>
                <div className="text-[11px] opacity-80">Dr. Bibek Thapa</div>
              </div>
              <div className="rounded-xl bg-paper-bright p-2 flex items-center gap-2 chat-float border-2 border-carbon shadow-[3px_3px_0_var(--color-carbon)]">
                <div className="w-7 h-7 rounded-full bg-volt grid place-items-center text-[10px] text-carbon font-bold border-2 border-carbon">AS</div>
                <div className="text-[11px] leading-tight">
                  <div className="font-semibold">Dr. Aarati</div>
                  <div className="text-text-light">See you at 10, keep icing</div>
                </div>
              </div>
              <svg viewBox="0 0 240 40" className="mt-auto w-full h-8" preserveAspectRatio="none">
                <path d="M0 30 L40 28 L60 12 L80 22 L100 6 L120 24 L150 18 L180 26 L210 10 L240 20" fill="none" stroke="var(--color-volt)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
