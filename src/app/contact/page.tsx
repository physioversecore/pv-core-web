"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: t("contact.subjectGeneral"), message: "" });

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
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.2fr_1fr] gap-8">
          <Reveal>
            <form onSubmit={submit} className="card-soft p-6 lg:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow block mb-1.5">{t("contact.formName")}</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder={t("contact.placeholderName")} />
                </label>
                <label className="block">
                  <span className="eyebrow block mb-1.5">{t("contact.formEmail")}</span>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder={t("contact.placeholderEmail")} />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow block mb-1.5">{t("contact.formPhone")}</span>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder={t("contact.placeholderPhone")} />
                </label>
                <label className="block">
                  <span className="eyebrow block mb-1.5">{t("contact.formSubject")}</span>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white">
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
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" placeholder={t("contact.placeholderMessage")} />
              </label>
              <button type="submit" className="btn-primary">{t("contact.sendMessage")}</button>
            </form>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-4">
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-secondary" style={{ background: "#D1E8DF" }}><Mail size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">{t("contact.emailLabel")}</div>
                  <div className="font-medium">{t("contact.emailValue")}</div>
                  <div className="text-xs text-text-light">{t("contact.emailDesc")}</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-secondary" style={{ background: "#D1E8DF" }}><Phone size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">{t("contact.phoneLabel")}</div>
                  <div className="font-medium">{t("contact.phoneValue")}</div>
                  <div className="text-xs text-text-light">{t("contact.phoneDesc")}</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-secondary" style={{ background: "#D1E8DF" }}><MapPin size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">{t("contact.officeLabel")}</div>
                  <div className="font-medium">{t("contact.officeValue")}</div>
                  <div className="text-xs text-text-light">{t("contact.officeDesc")}</div>
                </div>
              </div>
              <div className="card-soft p-5 flex gap-3">
                <span className="w-10 h-10 rounded-xl grid place-items-center text-secondary" style={{ background: "#D1E8DF" }}><Clock size={18} /></span>
                <div>
                  <div className="eyebrow mb-0.5">{t("contact.hoursLabel")}</div>
                  <div className="font-medium">{t("contact.hoursValue")}</div>
                  <div className="text-xs text-text-light">{t("contact.hoursDesc")}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
