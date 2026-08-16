"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { ServiceCard } from "@/components/ServiceCard";
import { SectionError } from "@/components/SectionError";
import { useServices } from "@/hooks/useServices";
import { ArrowRight } from "lucide-react";

function ServiceSkeleton() {
  return (
    <div className="flex min-h-[132px] animate-pulse flex-col rounded-xl border border-white/10 bg-white/[0.02] p-7">
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.07]" />
      <div className="mt-auto pt-5">
        <div className="h-3 w-full rounded bg-white/[0.05]" />
        <div className="mt-1.5 h-3 w-4/5 rounded bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function ServicesSection() {
  const { t } = useLang();
  const { data, isLoading, isError, refetch } = useServices();
  const services = data?.services ?? [];

  const clinicalServices = services.filter((s) => s.category === "CLINICAL");
  const shopServices = services.filter((s) => s.category === "SHOP");
  const all = [...clinicalServices, ...shopServices];

  const cardMeta = (category: string) => {
    const label =
      category === "SHOP"
        ? t("landing.servicesCategoryShop")
        : t("landing.servicesCategoryClinical");
    return `${label}`;
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-mid-abyss"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 text-center">
        <Reveal>
          <h2 className="font-sans text-heading-sm font-medium leading-snug tracking-[-0.02em] text-white sm:text-2xl">
            {t("landing.servicesTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-140 text-sm leading-relaxed text-ink-dim">
            {t("landing.servicesDesc")}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
          {isError ? (
            <div className="col-span-full">
              <SectionError onRetry={() => refetch()} />
            </div>
          ) : isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
          ) : (
            all.map((s, i) => (
              <Reveal key={s.id} delay={i * 80} className="h-full">
                <ServiceCard title={s.name} meta={cardMeta(s.category)} desc={s.description} />
              </Reveal>
            ))
          )}
        </div>

        <Reveal delay={100}>
          <Link
            href="/find-a-therapist"
            className="mt-12 inline-flex items-center justify-center rounded-lg bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-px hover:brightness-110"
          >
            {t("landing.servicesCta")}
            <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
