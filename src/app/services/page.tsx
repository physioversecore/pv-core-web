"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell } from "lucide-react";

export default function Services() {
  const { t } = useLang();

  const CLINICAL = [
    { icon: <Activity />, title: t("services.service1Title"), desc: t("services.service1Desc") },
    { icon: <HeartPulse />, title: t("services.service2Title"), desc: t("services.service2Desc") },
    { icon: <Brain />, title: t("services.service3Title"), desc: t("services.service3Desc") },
    { icon: <Baby />, title: t("services.service4Title"), desc: t("services.service4Desc") },
    { icon: <Bone />, title: t("services.service5Title"), desc: t("services.service5Desc") },
    { icon: <Dumbbell />, title: t("services.service6Title"), desc: t("services.service6Desc") },
  ];

  const SHOP = [
    { icon: <Stethoscope />, title: t("services.shopService1Title"), desc: t("services.shopService1Desc"), live: true },
    { icon: <ShoppingBag />, title: t("services.shopService2Title"), desc: t("services.shopService2Desc") },
    { icon: <Pill />, title: t("services.shopService3Title"), desc: t("services.shopService3Desc") },
    { icon: <Apple />, title: t("services.shopService4Title"), desc: t("services.shopService4Desc") },
  ];

  return (
    <PageShell
      eyebrow={t("services.eyebrow")}
      title={t("services.title")}
      subtitle={t("services.subtitle")}
    >
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">{t("services.clinicalEyebrow")}</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">{t("services.clinicalTitle")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CLINICAL.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="card-soft p-6 group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}>{s.icon}</div>
                  <div className="font-display text-lg mb-1">{s.title}</div>
                  <p className="text-text-light text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">{t("services.shopEyebrow")}</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">{t("services.shopTitle")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SHOP.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                  {s.live ? <span className="chip !bg-secondary !text-white absolute top-4 right-4">{t("services.live")}</span> : <span className="chip absolute top-4 right-4">{t("services.soon")}</span>}
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary" style={{ background: "#D1E8DF" }}>{s.icon}</div>
                  <div className="font-display text-lg mb-1">{s.title}</div>
                  <p className="text-text-light text-sm">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display text-3xl mb-4">{t("services.ctaTitle")}</h2>
          <p className="text-text-light mb-6">{t("services.ctaDesc")}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/find" className="btn-primary">{t("services.ctaFind")}</Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">{t("services.ctaContact")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
