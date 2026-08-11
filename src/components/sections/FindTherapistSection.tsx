"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { TherapistFilters } from "@/components/TherapistFilters";
import { TherapistCardGridSkeleton } from "@/components/SuspenseFallback";
import type { Therapist } from "@/lib/types";

interface FindTherapistSectionProps {
  q: string;
  city: string;
  spec: string;
  gender: string;
  filtered: Therapist[];
  hasMore?: boolean;
  loading?: boolean;
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
}

export function FindTherapistSection({
  q, city, spec, gender, filtered, hasMore, loading,
  onQChange, onCityChange, onSpecChange, onGenderChange,
}: FindTherapistSectionProps) {
  const { t } = useLang();
  return (
    <section id="find" className="bg-paper py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="label-ink mb-3">{t("find.eyebrow")}</p>
          <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter mb-10 max-w-3xl">{t("find.title")}</h2>
        </Reveal>

        <Reveal>
          <TherapistFilters
            q={q}
            city={city}
            spec={spec}
            gender={gender}
            onQChange={onQChange}
            onCityChange={onCityChange}
            onSpecChange={onSpecChange}
            onGenderChange={onGenderChange}
          />
        </Reveal>

        {loading ? (
          <TherapistCardGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 60}>
                <TherapistCard t={t} />
              </Reveal>
            ))}
            {filtered.length === 0 && (
              <p className="text-text-light text-sm col-span-full">{t("find.noMatch")}</p>
            )}
          </div>
        )}

        {hasMore && (
          <Reveal>
            <div className="mt-10 text-center">
              <Link href="/find-a-therapist" className="btn-outline-ink">
                {t("common.viewAll")} →
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
