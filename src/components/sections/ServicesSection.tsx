"use client";

import { Activity, Brain, HeartPulse, Baby, Stethoscope, ShoppingBag, Pill, Apple, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PlusField } from "@/components/PlusField";
import { ServiceCard } from "@/components/ServiceCard";
import { rehabServices, otherServices } from "@/lib/landing-data";
import type { ReactNode } from "react";

const iconMap: Record<string, LucideIcon> = {
  Activity, Brain, HeartPulse, Baby, Stethoscope, ShoppingBag, Pill, Apple,
};

export function ServicesSection() {
  return (
    <section id="services" className="py-20 relative bg-surface">
      <PlusField count={8} seed={7} />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow mb-3">Our services</p>
          <h2 className="text-4xl font-display mb-12 max-w-2xl">Everything for your recovery.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rehabServices.map((s, i) => {
            const Icon = iconMap[s.iconName];
            return (
              <Reveal key={s.title} delay={i * 100}>
                <ServiceCard icon={<Icon />} title={s.title} desc={s.desc} />
              </Reveal>
            );
          })}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {otherServices.map((s) => {
            const Icon = iconMap[s.iconName];
            return (
              <ServiceCard key={s.title} icon={<Icon />} title={s.title} desc={s.desc} live={s.live} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
