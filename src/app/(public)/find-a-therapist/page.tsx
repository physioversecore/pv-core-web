"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { Reveal } from "@/components/Reveal";
import { TherapistJobCard } from "@/components/TherapistJobCard";
import { Avatar } from "@/components/Avatar";
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

type SortKey = "trending" | "rated" | "price";

export default function FindPage() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const [sort, setSort] = useState<SortKey>("trending");
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

  const sorted = useMemo(() => {
    const list = [...therapists];
    if (sort === "rated") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "price") list.sort((a, b) => a.price - b.price);
    else list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [therapists, sort]);

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

  const stats = [
    { value: "10,000+", label: t("find.statSessions") },
    { value: "500+", label: t("find.statVerified") },
    { value: "4.9", label: `★ ${t("find.statRating")}` },
    { value: "24", label: t("find.statCities") },
  ];

  const sorts: { key: SortKey; label: string; icon: string }[] = [
    { key: "trending", label: t("find.sortTrending"), icon: "🔥" },
    { key: "rated", label: t("find.sortRated"), icon: "⭐" },
    { key: "price", label: t("find.sortPrice"), icon: "💰" },
  ];

  const selectCls =
    "w-full h-12 pl-3 pr-9 rounded-xl border border-border bg-white text-sm text-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition";
  const selectIconCls =
    "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none";

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          "radial-gradient(58rem 32rem at 28% 6%, rgba(122,243,255,0.16) 0%, rgba(122,243,255,0) 55%)," +
          "radial-gradient(62rem 36rem at 72% 10%, rgba(211,251,82,0.14) 0%, rgba(211,251,82,0) 55%)," +
          "linear-gradient(180deg, #052326 0%, #123E3B 20%, #7FA094 38%, #E2EDE7 58%, #FBFBF8 82%, #FFFFFF 100%)",
      }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 mb-5">
                <span className="w-2 h-2 rounded-full bg-voltage-lime" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
                  {t("find.eyebrow")}
                </span>
              </div>
              <h1 className="font-sans font-bold tracking-tight text-white text-4xl md:text-5xl xl:text-6xl leading-[1.05]">
                {t("find.heroTitle")}
              </h1>
              <p className="text-white/70 text-lg mt-5 max-w-xl">
                {t("find.heroSubtitle")}
              </p>
            </div>

            <div className="relative">
              <div className="card-soft rounded-2xl p-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl md:text-3xl font-bold text-text leading-none">
                      {s.value}
                    </div>
                    <div className="text-xs text-text-light mt-2 leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
              <div
                aria-hidden
                className="absolute -top-5 -right-3 phone-float w-14 h-14 rounded-full border border-white/70 bg-white/60 backdrop-blur-md grid place-items-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & filter ──────────────────────────────── */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="card-soft rounded-2xl p-3 grid sm:grid-cols-[1.6fr_1fr_1fr_1fr] gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("find.placeholderSearch")}
                    className="w-full h-12 pl-11 pr-3 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                <button
                  aria-label={t("find.search")}
                  className="h-12 w-12 shrink-0 rounded-xl bg-voltage-lime text-carbon-ink grid place-items-center hover:brightness-95 transition"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="relative">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
                  <option value="">{t("find.allCities")}</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={selectIconCls} />
              </div>

              <div className="relative">
                <select value={spec} onChange={(e) => setSpec(e.target.value)} className={selectCls}>
                  <option value="">{t("find.allSpecialties")}</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={selectIconCls} />
              </div>

              <div className="relative">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                  <option value="">{t("find.anyGender")}</option>
                  <option>{t("find.male")}</option>
                  <option>{t("find.female")}</option>
                </select>
                <ChevronDown size={16} className={selectIconCls} />
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {sorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition ${
                    sort === s.key
                      ? "border-secondary bg-secondary text-white"
                      : "border-border bg-white text-text-light hover:border-secondary/40 hover:text-text"
                  }`}
                >
                  <span className="leading-none">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-text-light">
                {isLoading ? t("common.loading") : `${total} ${t("find.therapistsFound")}`}
              </div>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-light hover:text-secondary transition"
                >
                  <X size={14} />
                  {t("common.clearFilters")}
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Therapist grid ───────────────────────────────── */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
            <Suspense fallback={<TherapistCardGridSkeleton count={8} />}>
              {isError ? (
                <SectionError onRetry={() => refetch()} />
              ) : isLoading ? (
                <TherapistCardGridSkeleton count={8} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sorted.map((th, i) => (
                    <Reveal key={th.id} delay={(i % 6) * 60}>
                      <TherapistJobCard t={th} onBook={handleBook} />
                    </Reveal>
                  ))}

                  {sorted.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-surface border border-border grid place-items-center mb-5">
                        <SearchX className="w-7 h-7 text-text-muted" />
                      </div>
                      <h3 className="text-2xl font-bold text-text">{t("find.noResultsTitle")}</h3>
                      <p className="text-text-light mt-2 max-w-sm">{t("find.noResultsDesc")}</p>
                      {hasFilters && (
                        <button
                          onClick={clearAll}
                          className="mt-6 px-5 py-2 rounded-full border border-border text-sm font-semibold text-text transition-colors hover:border-secondary hover:text-secondary"
                        >
                          {t("common.clearFilters")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Suspense>
          </ErrorBoundary>

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

      {/* ── Testimonial banner ───────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="grid lg:grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              <div className="relative bg-mid-abyss overflow-hidden min-h-[300px] flex items-center justify-center p-10">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -top-8 -right-8 w-72 h-72 rounded-full blur-3xl opacity-40"
                  style={{ background: "radial-gradient(circle, #d3fb52 0%, transparent 70%)" }}
                />
                <div
                  aria-hidden
                  className="absolute -bottom-10 -left-8 w-72 h-72 rounded-full blur-3xl opacity-30"
                  style={{ background: "radial-gradient(circle, #7af3ff 0%, transparent 70%)" }}
                />

                <div className="relative flex items-center">
                  <div className="blob-float-a">
                    <Avatar name="Anisha Shrestha" size={84} />
                  </div>
                  <div className="blob-float-b -ml-5 border-4 border-white rounded-full">
                    <Avatar name="Prakash Gurung" size={96} />
                  </div>
                  <div className="absolute -top-6 -right-2 phone-float bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-xs font-semibold text-text">4.9</span>
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 max-w-[250px] bg-white rounded-xl shadow-lg p-4 chat-float">
                  <p className="text-xs text-text leading-relaxed">“{t("find.bannerQuote")}”</p>
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-light">
                  {t("find.bannerEyebrow")}
                </p>
                <h2 className="mt-3 font-sans font-bold text-3xl md:text-4xl tracking-tight text-text">
                  {t("find.bannerTitle")}
                </h2>
                <p className="mt-3 text-text-light">{t("find.bannerText")}</p>
                <Link
                  href="/testimonials"
                  className="mt-8 inline-flex w-fit items-center gap-2 px-6 py-3 rounded-full bg-carbon-ink text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  {t("find.bannerCta")}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <AuthModal open={auth !== null} mode={auth ?? "login"} onClose={() => setAuth(null)} />
      {booking && <BookingModal therapist={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
