"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  MapPin,
  Clock,
  Phone,
  X,
} from "lucide-react";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useClinics } from "@/hooks/useClinics";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { CITIES } from "@/constants";

const PAGE_SIZE = 9;

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
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQ = useDebounce(q, 500);
  const hasFilters = q || city;

  const clearAll = () => {
    setQ("");
    setCity("");
  };

  const { data, isLoading } = useClinics({
    search: debouncedQ || undefined,
    city: city || undefined,
    page,
  });

  const clinics = data?.clinics ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [q, city]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  const selectCls =
    "w-full h-12 pl-3 pr-9 rounded-xl border border-border bg-white text-sm text-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition";
  const selectIconCls =
    "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none";

  return (
    <PageShell
      eyebrow={t("clinics.eyebrow")}
      title={t("clinics.title")}
      subtitle={t("clinics.subtitle")}
    >
      {/* ── Search & filter ──────────────────────────────── */}
      <section ref={searchRef} className="pb-10 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="card-soft rounded-2xl p-3 grid sm:grid-cols-[1.6fr_1fr] gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("clinics.searchPlaceholder")}
                    className="w-full h-12 pl-11 pr-3 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                <button
                  aria-label={t("clinics.search")}
                  className="h-12 w-12 shrink-0 rounded-xl bg-voltage-lime text-carbon-ink grid place-items-center hover:brightness-95 transition"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="relative">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={selectCls}
                >
                  <option value="">{t("clinics.allCities")}</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={selectIconCls} />
              </div>
            </div>
          </Reveal>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-light">
              {isLoading
                ? ""
                : `${total} ${t("clinics.results")}`}
            </p>
            {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-text/75 transition-colors hover:text-danger"
                    >
                      <X size={14} />
                      {t("common.clearFilters")}
                    </button>
                  )}
          </div>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────── */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 [grid-auto-rows:1fr]">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ClinicCardSkeleton key={i} />
                ))
              : clinics.map((clinic, i) => (
                  <Reveal key={clinic.id} delay={i * 60} className="h-full">
                    <div className="group h-full rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:shadow-md hover:border-voltage-lime/30">
                      <div className="grid size-10 place-items-center rounded-xl bg-voltage-lime/30 text-abyss-soft">
                        <Building2 className="size-5" />
                      </div>

                      <h3 className="mt-4 font-sans font-medium text-text text-md md:text-lg">
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

          {totalPages > 1 && (
            <Reveal>
              <div className="flex items-center justify-center gap-4 mt-10">
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
                        p === page ? "bg-secondary text-white" : "hover:bg-surface text-text-light"
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
    </PageShell>
  );
}
