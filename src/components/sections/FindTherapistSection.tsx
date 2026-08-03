"use client";

import Link from "next/link";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { TherapistFilters } from "@/components/TherapistFilters";
import type { Therapist } from "@/lib/types";

interface FindTherapistSectionProps {
  q: string;
  city: string;
  spec: string;
  gender: string;
  filtered: Therapist[];
  hasMore?: boolean;
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onBook: (t: Therapist) => void;
}

export function FindTherapistSection({
  q, city, spec, gender, filtered, hasMore,
  onQChange, onCityChange, onSpecChange, onGenderChange,
  onBook,
}: FindTherapistSectionProps) {
  const { t } = useLang();
  return (
    <section id="find" className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow mb-3">{t("find.eyebrow")}</p>
          <h2 className="text-4xl font-display mb-8 max-w-2xl">{t("find.title")}</h2>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={(i % 6) * 60}>
              <TherapistCard t={t} onBook={onBook} />
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <p className="text-text-light text-sm col-span-full">{t("find.noMatch")}</p>
          )}
        </div>

        {hasMore && (
          <Reveal>
            <div className="mt-8 text-center">
              <Link href="/find-a-therapist" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-secondary text-secondary hover:bg-secondary hover:text-white transition">
                {t("common.viewAll")} →
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
