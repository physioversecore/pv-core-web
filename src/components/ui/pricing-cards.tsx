"use client";

import { Check, MoveRight, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { useLang } from "@/context/i18n";
import { usePackages } from "@/hooks/usePackages";
import type { Package } from "@/types";

const ICON_MAP: Record<string, string> = {
  Brain: "\u{1F9E0}",
  Activity: "\u{2764}\uFE0F",
  HeartHandshake: "\u{1F91D}",
};

function PackageCard({ pkg, delay }: { pkg: Package; delay: number }) {
  const { t } = useLang();
  const icon = ICON_MAP[pkg.icon] ?? "\u{1F48E}";

  return (
    <Reveal delay={delay}>
      <Card
        className={`relative w-full rounded-2xl border h-full transition-all duration-200 hover:shadow-lg ${
          pkg.featured
            ? "border-voltage-lime/60 bg-white shadow-lg"
            : "border-border bg-white"
        }`}
      >
        {pkg.featured && (
          <div className="absolute -top-3 left-6">
            <Badge className="bg-voltage-lime text-carbon-ink border-0 text-[10px] font-semibold px-3 py-1">
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="pt-8">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{icon}</span>
            <span className="rounded-full bg-mid-abyss/5 border border-border px-2.5 py-1 text-[10px] font-medium text-text-light">
              {pkg.tag}
            </span>
          </div>
          <CardTitle className="mt-4 font-sans font-medium text-lg text-carbon-ink">
            {pkg.name}
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-ash">
            {pkg.blurb}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <p className="flex items-baseline gap-1 text-xl">
              <span className="font-display text-3xl font-semibold text-carbon-ink">
                Rs {pkg.price.toLocaleString()}
              </span>
              <span className="text-xs text-ash">{pkg.cadence}</span>
            </p>

            <div className="flex flex-col gap-3">
              {pkg.points.map((pt) => (
                <div key={pt} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-voltage-lime" />
                  <p className="text-sm text-text-light leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>

            {pkg.featured ? (
              <Button className="w-full gap-2 rounded-xl bg-voltage-lime text-carbon-ink hover:bg-voltage-lime/90 h-11 font-semibold">
                {t("packages.choosePackage")} <MoveRight className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-xl border-border h-11 font-medium"
              >
                {t("packages.choosePackage")} <MoveRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

export function PricingCards() {
  const { t } = useLang();
  const { data, isLoading } = usePackages();
  const packages = data?.packages ?? [];

  if (isLoading) {
    return (
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-6 w-20 rounded-full bg-surface animate-pulse" />
            <div className="h-8 w-64 rounded bg-surface animate-pulse" />
            <div className="h-5 w-96 max-w-full rounded bg-surface animate-pulse" />
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-6 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-surface" />
                <div className="mt-4 h-5 w-2/3 rounded bg-surface" />
                <div className="mt-2 h-3 w-full rounded bg-surface" />
                <div className="mt-6 h-8 w-1/2 rounded bg-surface" />
                <div className="mt-6 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-3 w-full rounded bg-surface" />
                  ))}
                </div>
                <div className="mt-6 h-10 w-full rounded-xl bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) return null;

  return (
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="secondary" className="bg-voltage-lime/10 text-carbon-ink border-0 text-xs font-semibold px-3 py-1">
            {t("packages.eyebrow")}
          </Badge>
          <h2 className="font-sans font-medium tracking-[-0.02em] text-carbon-ink"
            style={{ fontSize: "clamp(28px, 3.4vw, 48px)", lineHeight: 1.1 }}>
            {t("packages.title")}
          </h2>
          <p className="text-base text-ash max-w-xl leading-relaxed">
            {t("packages.subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 items-start">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
