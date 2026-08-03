"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { TherapistCard } from "@/components/TherapistCard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { TherapistCardGridSkeleton } from "@/components/SuspenseFallback";
import { AuthModal } from "@/components/AuthModal";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/auth";
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
  const [auth, setAuth] = useState<null | "login" | "signup">(null);
  const [booking, setBooking] = useState<Therapist | null>(null);
  const { user } = useAuth();

  const skip = (page - 1) * PAGE_SIZE;
  const hasFilters = q || city || spec || gender;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapists", page, q, city, spec, gender],
    queryFn: () =>
      getTherapists({
        skip,
        limit: PAGE_SIZE,
        search: q || undefined,
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

  const handleBook = (th: Therapist) => {
    if (!user) return setAuth("signup");
    setBooking(th);
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
              <div className="card-soft p-3 grid sm:grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("find.placeholderSearch")}
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
                  <option value="">{t("find.allCities")}</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={spec} onChange={(e) => setSpec(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
                  <option value="">{t("find.allSpecialties")}</option>
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-3 h-10 rounded-xl border border-border bg-white text-sm">
                  <option value="">{t("find.anyGender")}</option>
                  <option>{t("find.male")}</option>
                  <option>{t("find.female")}</option>
                </select>
              </div>
              {hasFilters && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-light hover:text-secondary transition"
                  >
                    <X size={14} />
                    {t("common.clearFilters")}
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          <div className="text-sm text-text-light mb-4">
            {isLoading ? t("common.loading") : `${total} ${t("find.therapistsFound")}`}
          </div>

          <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
            <Suspense fallback={<TherapistCardGridSkeleton count={9} />}>
              {isError ? (
                <SectionError onRetry={() => refetch()} />
              ) : isLoading ? (
                <TherapistCardGridSkeleton count={9} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {therapists.map((th, i) => (
                    <Reveal key={th.id} delay={(i % 6) * 60}>
                      <TherapistCard t={th} onBook={handleBook} />
                    </Reveal>
                  ))}
                  {therapists.length === 0 && (
                    <p className="text-text-light text-sm col-span-full">{t("find.noMatch")}</p>
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
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                        p === page
                          ? "bg-secondary text-white"
                          : "hover:bg-surface text-text-light"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-border disabled:opacity-40 hover:bg-surface transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </PageShell>
  );
}
