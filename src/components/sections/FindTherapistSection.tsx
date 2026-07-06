"use client";

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
  onQChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSpecChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onBook: (t: Therapist) => void;
}

export function FindTherapistSection({
  q, city, spec, gender, filtered,
  onQChange, onCityChange, onSpecChange, onGenderChange,
  onBook,
}: FindTherapistSectionProps) {
  return (
    <section id="find" className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <Reveal>
          <p className="eyebrow mb-3">Find a therapist</p>
          <h2 className="text-4xl font-display mb-8 max-w-2xl">Browse verified physiotherapists.</h2>
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
            <p className="text-text-light text-sm col-span-full">No therapists match your filters.</p>
          )}
        </div>
      </div>
    </section>
  );
}
