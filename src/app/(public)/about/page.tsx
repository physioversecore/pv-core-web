"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal, CountUp } from "@/components/Reveal";
import { Heart, ShieldCheck, HandHeart, Sparkles, ArrowRight, Star, Home, MapPin } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { VisualFrame, VISUAL_CARD } from "@/components/common/HowItWorksVisuals";

const VALUE_TONES = ["a", "b", "c", "b"];

function StoryVisual() {
  return (
    <VisualFrame tone="a">
      <div className={VISUAL_CARD}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-light">
            <Home size={12} className="text-secondary" />
            Today across Nepal
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-secondary">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-voltage-lime" />
            Live
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold tracking-[-0.02em] text-text">48</div>
            <div className="text-[11px] text-text-light">home visits today</div>
          </div>
          <div className="flex -space-x-2">
            <Avatar name="Dr. Anisha Shrestha" size={32} />
            <Avatar name="Dr. Prakash Gurung" size={32} />
            <Avatar name="Dr. Sita Lama" size={32} />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-white">+35</div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5">
            <MapPin size={13} className="shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-text">Baneshwor · Kathmandu</div>
              <div className="truncate text-[10.5px] text-text-light">Sports rehab · 45 min</div>
            </div>
            <span className="text-[10.5px] font-medium text-secondary">2:00 PM</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5">
            <MapPin size={13} className="shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-text">Pulchowk · Lalitpur</div>
              <div className="truncate text-[10.5px] text-text-light">Post-surgery · 60 min</div>
            </div>
            <span className="text-[10.5px] font-medium text-secondary">4:30 PM</span>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

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
      {/* ── Story ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
            <Reveal className="lg:order-1">
              <StoryVisual />
            </Reveal>
            <Reveal delay={120} className="lg:order-2">
              <div className="max-w-[440px]">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
                  <p className="eyebrow mb-0">{t("about.storyEyebrow")}</p>
                </div>
                <h2
                  className="font-sans font-medium tracking-[-0.02em] text-text"
                  style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
                >
                  {t("about.storyTitle")}
                </h2>
                <p className="mt-5 text-[15px] leading-[1.7] text-text-light">{t("about.para1")}</p>
                <p className="mt-4 text-[15px] leading-[1.7] text-text-light">{t("about.para2")}</p>
                <p className="mt-4 text-[15px] leading-[1.7] text-text-light">{t("about.para3")}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
              <p className="eyebrow mb-0">{t("about.valuesEyebrow")}</p>
            </div>
            <h2
              className="font-sans font-medium tracking-[-0.02em] text-text"
              style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
            >
              {t("about.valuesTitle")}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-white">
                  <div className={`feature-visual feature-visual-${VALUE_TONES[i]}`} style={{ aspectRatio: "16 / 9" }}>
                    <div className="feature-visual-grid" aria-hidden />
                    <div className="relative z-10 grid h-full place-items-center">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-secondary shadow-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                        {v.icon}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-[15px] font-semibold tracking-[-0.01em] text-text">{v.title}</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-text-light">{v.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
              <p className="eyebrow mb-0">{t("about.statsEyebrow")}</p>
            </div>
            <h2
              className="font-sans font-medium tracking-[-0.02em] text-text"
              style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
            >
              {t("about.statsTitle")}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mt-14 overflow-hidden rounded-[24px] bg-mid-abyss px-6 py-12 lg:mt-20 lg:rounded-[34px] lg:px-12 lg:py-16">
              <div className="feature-visual-grid" aria-hidden />
              <div
                aria-hidden
                className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-voltage-lime) 22%, transparent) 0%, transparent 70%)" }}
              />
              <div className="relative grid grid-cols-2 lg:grid-cols-4 text-center">
                {STATS.map((s, i) => (
                  <div key={i} className="py-4 lg:border-l lg:border-white/10 lg:first:border-l-0">
                    <div className="font-display text-4xl text-white lg:text-5xl">
                      {i === 3 ? (
                        <>4.8<span className="text-voltage-lime">{"\u2605"}</span></>
                      ) : (
                        <>
                          <CountUp to={s.to} />
                          <span className="text-voltage-lime">{s.s}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 font-mono text-xs uppercase tracking-widest text-white/50">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
            <Reveal className="lg:order-1">
              <div className="max-w-[440px]">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
                  <p className="eyebrow mb-0">{t("find.bannerEyebrow")}</p>
                </div>
                <h2
                  className="font-sans font-medium tracking-[-0.02em] text-text"
                  style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}
                >
                  {t("about.ctaTitle")}
                </h2>
                <p className="mt-4 max-w-[400px] text-[15px] leading-[1.6] text-text-light">{t("about.ctaDesc")}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
                  >
                    {t("about.ctaContact")}
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text transition-all duration-150 hover:-translate-y-0.5"
                  >
                    Apply as {t("common.applyToJoin")}
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="lg:order-2">
              <div className="relative">
                <VisualFrame tone="c">
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="blob-float-a">
                        <Avatar name="Dr. Prakash Shrestha" size={64} />
                      </div>
                      <div className="blob-float-b -ml-4 rounded-full border-4 border-white">
                        <Avatar name="Dr. Sudan Gurung" size={72} />
                      </div>
                    </div>
                    <div className="phone-float absolute -right-2 -top-6 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 shadow-xl ring-1 ring-black/5">
                      <Star size={14} className="fill-secondary text-secondary" />
                      <span className="text-xs font-semibold text-text">4.9</span>
                    </div>
                  </div>
                </VisualFrame>
                <div className="chat-float absolute bottom-4 left-4 z-20 hidden max-w-[250px] rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:block">
                  <p className="text-xs leading-relaxed text-text">“{t("find.bannerQuote")}”</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
