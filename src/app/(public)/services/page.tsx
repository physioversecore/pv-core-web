"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell, type LucideIcon } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { ServiceStackVisual } from "@/components/common/HowItWorksVisuals";
import type { ReactNode } from "react";

const iconMap: Record<string, LucideIcon> = {
  Activity, HeartPulse, Brain, Baby, Stethoscope, ShoppingBag, Pill, Apple, Bone, Dumbbell,
};

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

function ServiceRow({ icon, name, desc }: { icon: ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-border/70 py-3 last:border-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-secondary" style={{ background: "var(--color-surface)" }}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-text">{name}</div>
        <div className="mt-0.5 text-[12.5px] leading-relaxed text-text-light">{desc}</div>
      </div>
    </div>
  );
}

function CategoryRow({
  visual,
  eyebrow,
  title,
  live,
  liveLabel,
  items,
  ctaLabel,
  ctaHref,
  reversed,
}: {
  visual: ReactNode;
  eyebrow: string;
  title: string;
  live?: boolean;
  liveLabel?: string;
  items: ServiceItem[];
  ctaLabel: string;
  ctaHref: string;
  reversed?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
      <Reveal className={reversed ? "lg:order-2" : "lg:order-1"}>{visual}</Reveal>
      <Reveal delay={120} className={reversed ? "lg:order-1" : "lg:order-2"}>
        <div className="max-w-[400px]">
          <div className="flex items-center gap-3">
            <p className="eyebrow mb-0">{eyebrow}</p>
            {live && liveLabel && <span className="chip !bg-secondary !text-white">{liveLabel}</span>}
          </div>
          <h2
            className="mt-4 font-sans font-medium tracking-[-0.02em] text-text"
            style={{ fontSize: "clamp(24px, 2.2vw, 32px)", lineHeight: 1.15 }}
          >
            {title}
          </h2>
          <div className="mt-6">
            {items.map((s) => {
              const Icon = iconMap[s.iconName] || Activity;
              return <ServiceRow key={s.id} icon={<Icon size={15} />} name={s.name} desc={s.description} />;
            })}
          </div>
          <Link
            href={ctaHref}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-voltage-lime px-5 py-2.5 text-sm font-semibold text-carbon-ink transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110"
          >
            {ctaLabel}
            <ArrowRight size={15} />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20">
      <div className="animate-pulse">
        <div className="h-[332px] rounded-[24px] bg-surface lg:h-[424px] lg:rounded-[34px]" />
      </div>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-28 rounded bg-surface" />
        <div className="h-8 w-64 rounded bg-surface" />
        <div className="h-3 w-full rounded bg-surface" />
        <div className="h-3 w-5/6 rounded bg-surface" />
        <div className="h-3 w-2/3 rounded bg-surface" />
      </div>
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
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 space-y-24 lg:space-y-40">
          {isLoading ? (
            <>
              <LoadingRow />
              <LoadingRow />
            </>
          ) : (
            <>
              <CategoryRow
                visual={
                  <ServiceStackVisual
                    items={clinicalServices}
                    iconMap={iconMap}
                    accent="a"
                  />
                }
                eyebrow={t("services.clinicalEyebrow")}
                title={t("services.clinicalTitle")}
                items={clinicalServices}
                ctaLabel={t("services.ctaFind")}
                ctaHref="/find-a-therapist"
              />
              <CategoryRow
                reversed
                visual={
                  <ServiceStackVisual
                    items={shopServices}
                    iconMap={iconMap}
                    accent="b"
                  />
                }
                eyebrow={t("services.shopEyebrow")}
                title={t("services.shopTitle")}
                live
                liveLabel={t("services.live")}
                items={shopServices}
                ctaLabel={t("services.ctaContact")}
                ctaHref="/contact"
              />
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
