"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell, type LucideIcon } from "lucide-react";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, LucideIcon> = {
  Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell,
};

function CardSkeleton() {
  return (
    <div className="card-soft p-6 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-surface mb-3" />
      <div className="h-4 bg-surface rounded w-2/3 mb-2" />
      <div className="h-3 bg-surface rounded w-full" />
    </div>
  );
}

export default function Services() {
  const { t } = useLang();
  const { data, isLoading } = useServices();
  const services = data?.services ?? [];

  const clinicalServices = services.filter((s) => s.category === "CLINICAL");
  const shopServices = services.filter((s) => s.category === "SHOP");

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
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : clinicalServices.map((s, i) => {
                  const Icon = iconMap[s.iconName] || Activity;
                  return (
                    <Reveal key={s.id} delay={i * 80}>
                      <div className="card-soft p-6 group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                        <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}><Icon /></div>
                        <div className="font-display text-lg mb-1">{s.name}</div>
                        <p className="text-text-light text-sm">{s.description}</p>
                      </div>
                    </Reveal>
                  );
                })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3">{t("services.shopEyebrow")}</p>
            <h2 className="text-3xl font-display mb-10 max-w-2xl">{t("services.shopTitle")}</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              : shopServices.map((s, i) => {
                  const Icon = iconMap[s.iconName] || Activity;
                  return (
                    <Reveal key={s.id} delay={i * 80}>
                      <div className="card-soft p-6 relative group hover:-translate-y-1 hover:shadow-[0_18px_38px_-18px_rgba(47,93,80,.45)] transition duration-300">
                        <span className="chip !bg-secondary !text-white absolute top-4 right-4">{t("services.live")}</span>
                        <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 text-secondary group-hover:scale-110 group-hover:rotate-6 transition duration-300" style={{ background: "#D1E8DF" }}><Icon /></div>
                        <div className="font-display text-lg mb-1">{s.name}</div>
                        <p className="text-text-light text-sm">{s.description}</p>
                      </div>
                    </Reveal>
                  );
                })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
