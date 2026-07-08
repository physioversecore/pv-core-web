"use client";

import { Bell, FileText, MessageCircle, Smartphone } from "lucide-react";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";

export default function AppPage() {
  const { t } = useLang();

  const FEATURES = [
    { icon: <FileText size={18} />, text: t("app.feature1") },
    { icon: <MessageCircle size={18} />, text: t("app.feature2") },
    { icon: <Bell size={18} />, text: t("app.feature3") },
  ];

  return (
    <PageShell
      eyebrow={t("app.eyebrow")}
      title={t("app.title")}
      subtitle={t("app.subtitle")}
    >
      <section className="py-16 text-white relative overflow-hidden bg-background-dark">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl blob-drift" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <Reveal>
            <p className="eyebrow !text-primary mb-3">{t("app.builtForRecovery")}</p>
            <h2 className="text-3xl font-display mb-5">{t("app.sectionTitle")}</h2>
            <ul className="space-y-3 mb-7 text-white/85">
              {FEATURES.map((b) => (
                <li key={b.text} className="flex items-center gap-3">
                  <span className="w-8 h-8 grid place-items-center rounded-lg bg-white/10">{b.icon}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black text-white hover:bg-black/80 transition">
                <Smartphone size={20} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">{t("app.getItOn")}</span><span className="block text-sm font-semibold">{t("app.googlePlay")}</span></span>
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black text-white hover:bg-black/80 transition">
                <Smartphone size={20} />
                <span className="text-left leading-tight"><span className="block text-[10px] opacity-70">{t("app.downloadOnThe")}</span><span className="block text-sm font-semibold">{t("app.appStore")}</span></span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] bg-text border-[10px] border-black shadow-2xl phone-float">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl" />
              <div className="absolute inset-2 rounded-[2.4rem] bg-background text-text p-4 flex flex-col gap-3 overflow-hidden">
                <div className="text-[11px] font-mono text-text-light flex justify-between"><span>9:41</span><span>Sahayatri</span></div>
                <div className="rounded-2xl bg-white border border-border p-3 chat-float" style={{ animationDelay: "0.6s" }}>
                  <div className="text-xs text-text-light">Today&apos;s session</div>
                  <div className="font-display text-base leading-tight">Dr. Aarati Shrestha</div>
                  <div className="text-[11px] text-text-light">Knee rehab · 10:00 AM</div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden"><div className="h-full bg-secondary progress-fill" /></div>
                  <div className="text-[10px] text-text-light mt-1">Session 6 of 10</div>
                </div>
                <div className="rounded-2xl bg-secondary text-white p-3 chat-float" style={{ animationDelay: "1.2s" }}>
                  <div className="text-[11px] opacity-70">Next visit</div>
                  <div className="font-display text-base">Fri, Jul 5 · 4:00 PM</div>
                  <div className="text-[11px] opacity-80">Dr. Bibek Thapa</div>
                </div>
                <div className="rounded-2xl bg-white border border-border p-2 flex items-center gap-2 chat-float">
                  <div className="w-7 h-7 rounded-full bg-primary grid place-items-center text-[10px] text-white font-semibold">AS</div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-medium">Dr. Aarati</div>
                    <div className="text-text-light">See you at 10, keep icing</div>
                  </div>
                </div>
                <svg viewBox="0 0 240 40" className="mt-auto w-full h-8" preserveAspectRatio="none">
                  <path d="M0 30 L40 28 L60 12 L80 22 L100 6 L120 24 L150 18 L180 26 L210 10 L240 20" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
