"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Check, ArrowRight } from "lucide-react";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";
import { VisualFrame, VISUAL_CARD } from "@/components/common/HowItWorksVisuals";

function ReplyVisual() {
  return (
    <VisualFrame tone="b">
      <div className={VISUAL_CARD}>
        <div className="flex items-center gap-2.5">
          <Avatar name="Care Team" size={34} />
          <div>
            <div className="text-[13px] font-semibold text-text">Care team</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-text-light">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-voltage-lime" />
              Online now
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-3.5 py-2.5 text-[12px] leading-relaxed text-text">
            Hi! I'd like to book a home visit for my mother.
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-secondary px-3.5 py-2.5 text-[12px] leading-relaxed text-white">
            Of course — we can send a therapist to Jhamsikhel tomorrow. What time suits you?
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text">
            <Check size={12} className="text-secondary" />
            Replied in 2h
          </span>
          <span className="text-[11px] text-text-light">Avg response · 1 business day</span>
        </div>
      </div>
    </VisualFrame>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:font-normal placeholder:text-sm placeholder:text-text-light/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-voltage-lime/30 transition";

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: t("contact.subjectGeneral"), message: "" });

  const INFO = [
    { icon: <Mail size={18} />, label: t("contact.emailLabel"), value: t("contact.emailValue"), desc: t("contact.emailDesc") },
    { icon: <Phone size={18} />, label: t("contact.phoneLabel"), value: t("contact.phoneValue"), desc: t("contact.phoneDesc") },
    { icon: <MapPin size={18} />, label: t("contact.officeLabel"), value: t("contact.officeValue"), desc: t("contact.officeDesc") },
    { icon: <Clock size={18} />, label: t("contact.hoursLabel"), value: t("contact.hoursValue"), desc: t("contact.hoursDesc") },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t("contact.errorRequired"));
      return;
    }
    toast.success(t("contact.successSent"));
    setForm({ name: "", email: "", phone: "", subject: t("contact.subjectGeneral"), message: "" });
  };

  return (
    <PageShell
      eyebrow={t("contact.eyebrow")}
      title={t("contact.title")}
      subtitle={t("contact.subtitle")}
    >
      {/* ── Form + visual ─────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
            <Reveal className="lg:order-1">
              <ReplyVisual />
            </Reveal>
            <Reveal delay={120} className="lg:order-2">
              <div className="max-w-[440px]">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
                  <p className="eyebrow mb-0">{t("contact.eyebrow")}</p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="eyebrow block mb-1.5">{t("contact.formName")}</span>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder={t("contact.placeholderName")} />
                    </label>
                    <label className="block">
                      <span className="eyebrow block mb-1.5">{t("contact.formEmail")}</span>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder={t("contact.placeholderEmail")} />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow block mb-1.5">{t("contact.formPhone")}</span>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder={t("contact.placeholderPhone")} />
                    </label>
                    <label className="block">
                      <span className="eyebrow block mb-1.5">{t("contact.formSubject")}</span>
                      <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass}>
                        <option>{t("contact.subjectGeneral")}</option>
                        <option>{t("contact.subjectBooking")}</option>
                        <option>{t("contact.subjectBilling")}</option>
                        <option>{t("contact.subjectPartnership")}</option>
                        <option>{t("contact.subjectTherapistApp")}</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow block mb-1.5">{t("contact.formMessage")}</span>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={8} className={inputClass} placeholder={t("contact.placeholderMessage")} />
                  </label>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110">
                    {t("contact.sendMessage")}
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Direct lines ──────────────────────────────────── */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
              <p className="eyebrow mb-0">{t("contact.eyebrow")}</p>
            </div>
            <h2
              className="font-sans font-medium tracking-[-0.02em] text-text"
              style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
            >
              {t("contact.infoTitle")}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {INFO.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex h-full flex-col gap-3 rounded-[24px] border border-border bg-white p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-secondary">{item.icon}</div>
                  <div>
                    <div className="eyebrow mb-1">{item.label}</div>
                    <div className="text-[15px] font-semibold text-text">{item.value}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-text-light">{item.desc}</div>
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
