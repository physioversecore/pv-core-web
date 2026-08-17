"use client";

import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Building2, MapPin, Clock, Phone } from "lucide-react";
import { useClinics } from "@/hooks/useClinics";

function ClinicCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-surface" />
      <div className="mt-4 h-5 w-2/3 rounded bg-surface" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-surface" />
        <div className="h-3 w-3/4 rounded bg-surface" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-surface" />
        <div className="h-6 w-20 rounded-full bg-surface" />
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const { t } = useLang();
  const { data, isLoading } = useClinics();
  const clinics = data?.clinics ?? [];

  return (
    <PageShell
      eyebrow={t("clinics.eyebrow")}
      title={t("clinics.title")}
      subtitle={t("clinics.subtitle")}
    >
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:1fr]">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ClinicCardSkeleton key={i} />
                ))
              : clinics.map((clinic, i) => (
                  <Reveal key={clinic.id} delay={i * 60} className="h-full">
                    <div className="group h-full rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:shadow-md hover:border-voltage-lime/30">
                      <div className="grid size-10 place-items-center rounded-xl bg-voltage-lime/10 text-voltage-lime">
                        <Building2 className="size-5" />
                      </div>

                      <h3 className="mt-4 font-sans font-medium text-text text-[15px]">
                        {clinic.name}
                      </h3>

                      <p className="mt-1 flex items-start gap-1.5 text-sm text-text-light">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        {clinic.address}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {clinic.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] text-text-light"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        <p className="flex items-center gap-1.5 text-xs text-text-light">
                          <Clock className="size-3.5" />
                          {clinic.hours}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs font-medium text-text">
                          <Phone className="size-3.5" />
                          {clinic.phone}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
          </div>

          {!isLoading && clinics.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-text-light">{t("clinics.noResults")}</p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
