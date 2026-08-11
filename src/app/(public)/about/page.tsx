"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal, CountUp } from "@/components/Reveal";
import { Heart, ShieldCheck, HandHeart, Sparkles, ArrowUpRight } from "lucide-react";

export default function About() {
  const { t } = useLang();

  const VALUES = [
    { icon: <ShieldCheck />, title: t("about.value1Title"), desc: t("about.value1Desc") },
    { icon: <Heart />, title: t("about.value2Title"), desc: t("about.value2Desc") },
    { icon: <HandHeart />, title: t("about.value3Title"), desc: t("about.value3Desc") },
    { icon: <Sparkles />, title: t("about.value4Title"), desc: t("about.value4Desc") },
  ];

  const STATS = [
    { to: 12400, s: "&plus;", l: t("about.statHomeVisits") },
    { to: 180, s: "&plus;", l: t("about.statTherapists") },
    { to: 6, s: "", l: t("about.statCities") },
    { to: 4.8, s: "&#11088;", l: t("about.statRating") },
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
            <p className="eyebrow mb-2">{t("about.valuesEyebrow")}</p>
            <h2 className="text-3xl font-display font-bold mb-10 max-w-2xl">{t("about.valuesTitle")}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="card-neo card-neo-hover p-6">
                  <div className="w-11 h-11 rounded-lg grid place-items-center mb-3 text-carbon bg-mint border-2 border-carbon shadow-[3px_3px_0_var(--color-carbon)]">{v.icon}</div>
                  <div className="font-display font-bold text-lg mb-1">{v.title}</div>
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
              <div className="font-display font-extrabold text-4xl text-moss">
                 <><CountUp to={s.to} /><span className="text-olive" dangerouslySetInnerHTML={{__html:`${s.s}`}}></span></>
              </div>
              <div className="text-xs text-text-light mt-2 font-mono uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl mb-2">{t("about.ctaTitle")}</h2>
          <p className="text-text-light mb-8">{t("about.ctaDesc")}</p>
          <Link href="/for-physiotherapists/#enroll" className="btn-outline-ink inline-flex item-center gap-1 uppercase">{t("about.ctaTherapists")} <ArrowUpRight size={16}/> </Link>
          </div>
      </section>
    </PageShell>
  );
}
