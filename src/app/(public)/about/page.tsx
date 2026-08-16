"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal, CountUp } from "@/components/Reveal";
import { Heart, ShieldCheck, HandHeart, Sparkles, ArrowRight, Star } from "lucide-react";
import { Avatar } from "@/components/Avatar";

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

      <section className="py-16">
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

      {/* ── Testimonial banner ───────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="grid lg:grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              <div className="relative bg-mid-abyss overflow-hidden min-h-[300px] flex items-center justify-center p-10">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -top-8 -right-8 w-72 h-72 rounded-full blur-3xl opacity-40"
                  style={{ background: "radial-gradient(circle, #d3fb52 0%, transparent 70%)" }}
                />
                <div
                  aria-hidden
                  className="absolute -bottom-10 -left-8 w-72 h-72 rounded-full blur-3xl opacity-30"
                  style={{ background: "radial-gradient(circle, #7af3ff 0%, transparent 70%)" }}
                />

                <div className="relative flex items-center">
                  <div className="blob-float-a">
                    <Avatar name="Dr. Prakash Shrestha" size={84} />
                  </div>
                  <div className="blob-float-b -ml-5 border-4 border-white rounded-full">
                    <Avatar name="Dr. Sudan Gurung" size={96} />
                  </div>
                  <div className="absolute -top-6 -right-2 phone-float bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-xs font-semibold text-text">4.9</span>
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 max-w-[250px] bg-white rounded-xl shadow-lg p-4 chat-float">
                  <p className="text-xs text-text leading-relaxed">“{t("about.bannerQuote")}”</p>
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-light">
                  {t("about.bannerEyebrow")}
                </p>
                <h2 className="mt-3 font-sans font-bold text-3xl md:text-4xl tracking-tight text-text">
                  {t("about.ctaTitle")}
                </h2>
                <p className="mt-3 text-text-light text-sm">{t("about.ctaDesc")}</p>
                <Link
                  href="/contact"
                  className="mt-8 inline-flex w-fit items-center gap-2 px-6 py-3 rounded-full bg-carbon-ink text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  {t("about.ctaContact")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
