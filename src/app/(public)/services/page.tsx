"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { SectionError } from "@/components/SectionError";
import {
  Activity,
  HeartPulse,
  Brain,
  Baby,
  Stethoscope,
  ShoppingBag,
  Pill,
  Apple,
  Bone,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { useServices, type ServiceData } from "@/hooks/useServices";

const iconMap: Record<string, LucideIcon> = {
  Activity,
  HeartPulse,
  Brain,
  Baby,
  Stethoscope,
  ShoppingBag,
  Pill,
  Apple,
  Bone,
  Dumbbell,
};

function CardSkeleton() {
  return (
    <div className="md:col-span-6 lg:col-span-4">
      <div className="card-neo p-6 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-surface border-2 border-carbon mb-3" />
        <div className="h-4 bg-surface border border-carbon rounded w-2/3 mb-2" />
        <div className="h-3 bg-surface border border-carbon rounded w-full" />
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  badge,
}: {
  service: ServiceData;
  index: number;
  badge?: string;
}) {
  const { t } = useLang();
  const Icon = iconMap[service.iconName] || Activity;

  if (index == 0) {
    return (
      <Reveal className="md:col-span-12">
        <Link href={`/services/${service.id}`} className="block h-full">
          <article className="card-neo card-neo-hover overflow-hidden flex flex-col md:flex-row h-full group">
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between order-2 md:order-1">
              {/*{badge && <span className="chip-volt self-start mb-8">{badge}</span>}*/}
              <div className="mt-8">
                <div className="w-12 h-12 rounded-xl grid place-items-center mb-4 text-carbon bg-volt border-2 border-carbon group-hover:scale-110 group-hover:rotate-6 transition duration-300">
                  <Icon size={22} />
                </div>
                <h3 className="font-display font-extrabold uppercase text-2xl md:text-4xl tracking-tighter text-carbon mb-4">
                  {service.name}
                </h3>
                <p className="text-text-light text-sm leading-relaxed max-w-md">
                  {service.description}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 font-mono font-bold uppercase text-[11px] tracking-wide text-moss group-hover:underline group-hover:decoration-moss transition-colors">
                  {t("services.learnMore")} →
                </p>
              </div>
            </div>
            <div className="md:w-1/2 h-48 md:h-auto order-1 md:order-2 relative bg-mint grid-bg overflow-hidden">
              <span
                aria-hidden
                className="absolute font-display font-extrabold uppercase leading-none text-carbon/10 select-none text-[7rem] md:text-[9rem] -right-3 -bottom-8"
              >
                0{index + 1}
              </span>
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-volt border-2 border-carbon grid place-items-center shadow-[6px_6px_0_var(--color-carbon)]">
                    <Icon size={40} strokeWidth={2} className="text-carbon" />
                  </div>
                  <span className="absolute -right-10 -top-2 w-7 h-7 rounded-full bg-paper-bright border-2 border-carbon shadow-[3px_3px_0_var(--color-carbon)]" />
                  <span className="absolute -left-9 bottom-2 w-5 h-5 rounded-full bg-carbon" />
                </div>
              </div>
            </div>
          </article>
        </Link>
      </Reveal>
    );
  }

  return (
    <Reveal className="md:col-span-6 lg:col-span-4" delay={index * 80}>
      <Link href={`/services/${service.id}`} className="block h-full">
        <div className="card-neo card-neo-hover p-6 relative group h-full">
          {badge && <span className="chip-volt absolute top-4 right-4">{badge}</span>}
          <div className="w-12 h-12 rounded-xl grid place-items-center mb-3 text-carbon bg-volt border-2 border-carbon group-hover:scale-110 group-hover:rotate-6 transition duration-300">
            <Icon />
          </div>
          <div className="font-display font-bold text-lg mb-1">{service.name}</div>
          <p className="text-text-light text-sm">{service.description}</p>
          <p className="mt-4 inline-flex items-center gap-1 font-mono font-bold uppercase text-[11px] tracking-wide text-moss group-hover:underline group-hover:decoration-moss transition-colors">
            {t("services.learnMore")} →
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Services() {
  const { t } = useLang();
  const { data, isLoading, isError, refetch } = useServices();
  const services = data?.services ?? [];

  const clinicalServices = services.filter((s) => s.category === "CLINICAL");
  const shopServices = services.filter((s) => s.category === "SHOP");

  const handleRetry = () => refetch();

  return (
    <PageShell
      eyebrow={t("services.eyebrow")}
      title={t("services.title")}
      subtitle={t("services.subtitle")}
    >
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="label-ink mb-3">{t("services.clinicalEyebrow")}</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter mb-10 max-w-2xl">
              {t("services.clinicalTitle")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {isError ? (
              <div className="md:col-span-12">
                <SectionError onRetry={handleRetry} />
              </div>
            ) : isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              clinicalServices.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-moss grid-bg">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <p className="label-ink mb-3 text-volt">{t("services.shopEyebrow")}</p>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase text-paper-bright tracking-tighter mb-10 max-w-2xl">
              {t("services.shopTitle")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {isError ? (
              <div className="md:col-span-12">
                <SectionError onRetry={handleRetry} />
              </div>
            ) : isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              shopServices.map((s, i) => (
                <ServiceCard key={s.id} service={s} index={i} badge={t("services.soon")} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-paper">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-4xl uppercase tracking-tighter mb-2">
            {t("services.ctaTitle")}
          </h2>
          <p className="text-text-light mb-8">{t("services.ctaDesc")}</p>
          <Link href="/contact" className="btn-outline-ink uppercase text-sm">
            {t("services.ctaContact")} →{" "}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
