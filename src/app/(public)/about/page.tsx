"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal, CountUp } from "@/components/Reveal";
import { Heart, ShieldCheck, HandHeart, Sparkles } from "lucide-react";

export default function About() {
  const { t } = useLang();

  const VALUES = [
    { icon: <ShieldCheck />, title: t("about.value1Title"), desc: t("about.value1Desc") },
    { icon: <Heart />, title: t("about.value2Title"), desc: t("about.value2Desc") },
    { icon: <HandHeart />, title: t("about.value3Title"), desc: t("about.value3Desc") },
    { icon: <Sparkles />, title: t("about.value4Title"), desc: t("about.value4Desc") },
  ];

  const STATS = [
    { to: 12400, s: "+", l: t("about.statHomeVisits") },
    { to: 180, s: "+", l: t("about.statTherapists") },
    { to: 6, s: "", l: t("about.statCities") },
    { to: 48, s: "\u2605", l: t("about.statRating") },
  ];

  return (
    <PageShell
      eyebrow={t("about.eyebrow")}
      title={t("about.title")}
      subtitle={t("about.subtitle")}
    >
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-5 text-text-light">
          <p>{t("about.para1")}</p>
          <p>{t("about.para2")}</p>
          <p>{t("about.para3")}</p>
        </div>
      </section>

      <section className="py-16 bg-surface/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">{t("about.valuesEyebrow")}</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">{t("about.valuesTitle")}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="card-soft p-6">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary" style={{ background: "#D1E8DF" }}>{v.icon}</div>
                  <div className="font-display text-lg mb-1">{v.title}</div>
                  <p className="text-text-light text-sm">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 md:grid-cols-4 text-center">
          {STATS.map((s, i) => (
            <div key={i} className={`py-4 ${i > 0 ? "md:border-l border-border" : ""}`}>
              <div className="font-display text-4xl text-secondary">
                {i === 3 ? <>4.8<span className="text-primary">\u2605</span></> : <><CountUp to={s.to} /><span className="text-primary">{s.s}</span></>}
              </div>
              <div className="text-xs text-text-light mt-2 font-mono uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">{t("about.ctaTitle")}</h2>
          <p className="text-text-light mb-6">{t("about.ctaDesc")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-primary">{t("about.ctaContact")}</Link>
            <Link href="/find-a-therapist" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">{t("about.ctaTherapists")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
