"use client";

import { useLang } from "@/context/i18n";
import { Activity, Brain, HeartPulse, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PlusField } from "@/components/PlusField";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionError } from "@/components/SectionError";
import { useServices } from "@/hooks/useServices";

const iconMap: Record<string, LucideIcon> = {
  Activity, Brain, HeartPulse, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell,
};

function ServiceSkeleton() {
  return (
    <div className="card-neo p-6 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-surface border-2 border-carbon mb-3" />
      <div className="h-4 bg-surface border border-carbon rounded w-2/3 mb-2" />
      <div className="h-3 bg-surface border border-carbon rounded w-full" />
    </div>
  );
}

export function ServicesSection() {
  const { t } = useLang();
  const { data, isLoading, isError, refetch } = useServices();
  const services = data?.services ?? [];

  const clinicalServices = services.filter((s) => s.category === "CLINICAL");
  const shopServices = services.filter((s) => s.category === "SHOP");

  return (
    <section id="services" className="py-20 md:py-28 relative bg-mint">
      <PlusField count={8} seed={7} />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="label-ink mb-3">{t("landing.servicesEyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-12 max-w-3xl">{t("landing.servicesTitle")}</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isError ? (
            <div className="col-span-full"><SectionError onRetry={() => refetch()} /></div>
          ) : isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
            : clinicalServices.map((s, i) => {
                const Icon = iconMap[s.iconName] || Activity;
                return (
                  <Reveal key={s.id} delay={i * 100}>
                    <ServiceCard icon={<Icon />} title={s.name} desc={s.description} />
                  </Reveal>
                );
              })}
        </div>
        <Reveal>
          <p className="label-ink mb-3 mt-14">{t("landing.otherServicesEyebrow")}</p>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-tighter mb-10 max-w-3xl">{t("landing.otherServicesTitle")}</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isError ? (
            <div className="col-span-full"><SectionError onRetry={() => refetch()} /></div>
          ) : isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ServiceSkeleton key={i} />)
            : shopServices.map((s, i) => {
                const Icon = iconMap[s.iconName] || Activity;
                return (
                  <Reveal key={s.id} delay={i * 100}>
                    <ServiceCard icon={<Icon />} title={s.name} desc={s.description} live={s.category === "SHOP"} />
                  </Reveal>
                );
              })}
        </div>
      </div>
    </section>
  );
}
