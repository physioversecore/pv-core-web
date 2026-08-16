"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell, ArrowLeft, Home, Scan, Zap, CalendarCheck, type LucideIcon } from "lucide-react";
import { useLang } from "@/context/i18n";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { getService } from "@/services/api/services";

const iconMap: Record<string, LucideIcon> = {
  Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell,
};

const EXPECT = [
  { icon: <Home size={48} strokeWidth={1.5} />, num: "01", titleKey: "step1Title", descKey: "step1Desc" },
  { icon: <Scan size={48} strokeWidth={1.5} />, num: "02", titleKey: "step2Title", descKey: "step2Desc" },
  { icon: <Zap size={48} strokeWidth={1.5} />, num: "03", titleKey: "step3Title", descKey: "step3Desc" },
] as const;

export default function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t } = useLang();

  const { data: service, isLoading, isError, refetch } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => getService(slug),
    enabled: !!slug,
  });

  const Icon = service ? iconMap[service.iconName] || Activity : Activity;

  return (
    <main className="bg-white text-carbon min-h-screen">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ash hover:text-carbon transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("serviceDetails.backToServices")}
        </Link>

        <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          {isError ? (
            <SectionError onRetry={() => refetch()} />
          ) : isLoading || !service ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <div className="card-neo p-8 animate-pulse space-y-3">
                  <div className="h-8 bg-surface border border-hairline rounded w-1/2" />
                  <div className="h-4 bg-surface border border-hairline rounded w-3/4" />
                  <div className="h-4 bg-surface border border-hairline rounded w-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 bg-white border border-hairline p-6 md:p-12 rounded-2xl">
                <span className="inline-block bg-volt px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
                  {t("serviceDetails.chip")}
                </span>
                <h1 className="font-display font-extrabold text-4xl md:text-6xl uppercase tracking-tighter break-words text-carbon">
                  {service.name}
                </h1>
              </div>

              <div className="lg:col-span-7 h-[300px] md:h-[400px] bg-white border border-hairline rounded-2xl relative overflow-hidden grid place-items-center group">
                <div aria-hidden className="absolute inset-0 opacity-60 hero-gradient-bg" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-volt border border-carbon/10 grid place-items-center group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300">
                  <Icon size={72} strokeWidth={1.5} className="text-carbon" />
                </div>
                <span className="absolute top-4 left-4 bg-volt px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full">
                  {service.category}
                </span>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-6 h-[300px] md:h-[400px]">
                <div className="flex-1 bg-white border border-hairline p-6 md:p-8 rounded-2xl overflow-y-auto">
                  <h2 className="font-display font-extrabold uppercase tracking-tight text-2xl mb-4 pb-4 border-b border-hairline">
                    {t("serviceDetails.overview")}
                  </h2>
                  <p className="text-ash text-sm leading-relaxed">{service.description}</p>
                </div>
                <div className="bg-volt p-6 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-carbon/70 mb-1">{t("serviceDetails.sessionRate")}</p>
                      <p className="font-display font-extrabold text-3xl uppercase text-carbon">{t("serviceDetails.findTherapist")}</p>
                    </div>
                    <CalendarCheck size={36} strokeWidth={1.5} />
                  </div>
                  <Link href="/find-a-therapist" className="btn-carbon w-full text-center">
                    {t("serviceDetails.bookSession")}
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-12 bg-white border border-hairline rounded-2xl overflow-hidden">
                <div className="p-6 md:p-8 border-b border-hairline bg-volt">
                  <h2 className="font-display font-extrabold uppercase tracking-tight text-2xl md:text-3xl flex items-center gap-4">
                    <span className="text-[40px] md:text-5xl"><Home strokeWidth={1.5} /></span>
                    {t("serviceDetails.homeVisitTitle")}
                  </h2>
                </div>
                <div className="flex flex-col">
                  {EXPECT.map((e, i) => (
                    <div
                      key={e.num}
                      className={`flex flex-col md:flex-row group hover:bg-mint transition-colors ${i < EXPECT.length - 1 ? "border-b border-hairline" : ""}`}
                    >
                      <div className="p-6 md:p-8 md:w-1/4 border-b md:border-b-0 md:border-r border-hairline flex items-center gap-4">
                        <span className="font-display font-extrabold text-5xl md:text-6xl text-carbon/15 group-hover:text-carbon transition-colors">{e.num}</span>
                        <span className="md:hidden text-carbon">{e.icon}</span>
                      </div>
                      <div className="p-6 md:p-8 md:w-3/4 flex flex-col justify-center">
                        <h3 className="font-display font-extrabold uppercase tracking-tight text-xl mb-2 flex items-center gap-3">
                          <span className="hidden md:block text-carbon">{e.icon}</span>
                          {t(`serviceDetails.${e.titleKey}`)}
                        </h3>
                        <p className="text-ash text-sm leading-relaxed">{t(`serviceDetails.${e.descKey}`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </main>
  );
}
