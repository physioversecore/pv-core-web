"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { TherapistCardGridSkeleton } from "@/components/SuspenseFallback";
import { CITIES, SPECIALTIES } from "@/constants";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

const PAGE_SIZE = 10;

export default function FindPage() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);

  const debouncedQ = useDebounce(q, 400);
  const skip = (page - 1) * PAGE_SIZE;
  const hasFilters = q || city || spec || gender;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapists", page, debouncedQ, city, spec, gender],
    queryFn: () =>
      getTherapists({
        skip,
        limit: PAGE_SIZE,
        search: debouncedQ || undefined,
        city: city || undefined,
        specialty: spec || undefined,
        gender: gender || undefined,
      }),
  });

  const therapists: Therapist[] = (data?.therapists ?? []).map((th) => ({
    ...th,
    gender: th.gender as "Male" | "Female",
  }));

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [q, city, spec, gender]);

  const clearAll = () => {
    setQ("");
    setCity("");
    setSpec("");
    setGender("");
  };

  return (
    <PageShell
      eyebrow={t("find.eyebrow")}
      title={t("find.title")}
      subtitle={t("find.subtitle")}
    >
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="mb-8">
              <div className="card-neo p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("find.placeholderSearch")}
                    className="input-neo pl-9 h-11"
                  />
                </div>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 h-11 rounded-xl border-2 border-carbon bg-paper-bright text-sm shadow-[3px_3px_0_var(--color-carbon)]">
                  <option value="">{t("find.allCities")}</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={spec} onChange={(e) => setSpec(e.target.value)} className="px-3 h-11 rounded-xl border-2 border-carbon bg-paper-bright text-sm shadow-[3px_3px_0_var(--color-carbon)]">
                  <option value="">{t("find.allSpecialties")}</option>
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-3 h-11 rounded-xl border-2 border-carbon bg-paper-bright text-sm shadow-[3px_3px_0_var(--color-carbon)]">
                  <option value="">{t("find.anyGender")}</option>
                  <option>{t("find.male")}</option>
                  <option>{t("find.female")}</option>
                </select>
              </div>
              {hasFilters && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-light hover:text-danger transition"
                  >
                    <X size={14} />
                    {t("common.clearFilters")}
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          {!isLoading && <div className="font-display text-xs lg:text-sm  text-text-light mb-4 uppercase">
            {total} {t("find.therapistsFound")}
          </div> }

          <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
            <Suspense fallback={<TherapistCardGridSkeleton count={9} />}>
              {isError ? (
                <SectionError onRetry={() => refetch()} />
              ) : isLoading ? (
                <TherapistCardGridSkeleton count={9} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {therapists.map((th, i) => (
                    <Reveal key={th.id} delay={(i % 6) * 60}>
                      <TherapistCard t={th} />
                    </Reveal>
                  ))}
                  {therapists.length === 0 && (
                    <p className="font-display uppercase text-text-light text-sm col-span-full">{t("find.noMatch")}</p>
                  )}
                </div>
              )}
            </Suspense>
          </ErrorBoundary>

          {totalPages > 1 && (
            <Reveal>
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border-2 border-carbon bg-paper-bright shadow-[3px_3px_0_var(--color-carbon)] disabled:opacity-40 hover:bg-surface transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-sm font-bold transition ${
                        p === page
                          ? "bg-carbon text-white border-2 border-carbon shadow-[2px_2px_0_var(--color-carbon)]"
                          : "bg-paper-bright border-2 border-carbon text-text-light"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border-2 border-carbon bg-paper-bright shadow-[3px_3px_0_var(--color-carbon)] disabled:opacity-40 hover:bg-surface transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </PageShell>
  );
}
