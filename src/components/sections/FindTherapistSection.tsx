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
  onBook: (t: Therapist) => void;
}

export function FindTherapistSection({
  q, city, spec, gender, filtered, hasMore, loading,
  onQChange, onCityChange, onSpecChange, onGenderChange,
  onBook,
}: FindTherapistSectionProps) {
  const { t } = useLang();
  return (
    <section id="find" className="py-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow !text-white/50 mb-3">{t("find.eyebrow")}</p>
          <h2 className="text-4xl font-display mb-8 max-w-2xl">{t("find.title")}</h2>
        </Reveal>

        <Reveal>
          <TherapistFilters
            q={q}
            city={city}
            spec={spec}
            gender={gender}
            variant="dark"
            onQChange={onQChange}
            onCityChange={onCityChange}
            onSpecChange={onSpecChange}
            onGenderChange={onGenderChange}
          />
        </Reveal>

        {loading ? (
          <TherapistCardGridSkeleton count={6} variant="dark" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => (
              <Reveal key={t.id} delay={(i % 6) * 60}>
                <TherapistCard t={t} onBook={onBook} variant="dark" />
              </Reveal>
            ))}
            {filtered.length === 0 && (
              <p className="text-white/60 text-sm col-span-full">{t("find.noMatch")}</p>
            )}
          </div>
        )}

        {hasMore && (
          <Reveal>
            <div className="mt-8 text-center">
              <Link href="/find-a-therapist" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-voltage-lime text-voltage-lime hover:bg-voltage-lime hover:text-carbon-ink transition">
                {t("common.viewAll")} →
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
