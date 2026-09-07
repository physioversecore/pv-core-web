"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { useLang } from "@/context/i18n";
import { SPECIALTIES } from "@/constants";
import { getTherapists, type TherapistData } from "@/services/api/therapists";
import { npr } from "@/utils/format";
import { Avatar } from "@/components/common/Avatar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { TherapistCardGridSkeleton } from "@/components/SuspenseFallback";

const CHIPS = SPECIALTIES.slice(0, 4);

export function HeroSection({ onBook }: { onBook?: (t: TherapistData) => void }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const [phText, setPhText] = useState("");
  const [phDeleting, setPhDeleting] = useState(false);

  const phrases = useMemo(
    () => [t("landing.heroSearchPhrase0"), t("landing.heroSearchPhrase1"), t("landing.heroSearchPhrase2"), t("landing.heroSearchPhrase3")],
    [lang],
  );

  useEffect(() => {
    const word = phrases[phIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!phDeleting) {
      if (phText.length < word.length) {
        timeout = setTimeout(() => setPhText(word.slice(0, phText.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setPhDeleting(true), 1800);
      }
    } else if (phText.length > 0) {
      timeout = setTimeout(() => setPhText(word.slice(0, phText.length - 1)), 30);
    } else {
      setPhDeleting(false);
      setPhIndex((i) => (i + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [phText, phDeleting, phIndex, phrases]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (query) {
      router.push(`/find-a-therapist?q=${encodeURIComponent(query)}`);
    }
  };

  const chip = (value: string) => {
    setQ(value);
    router.push(
      `/find-a-therapist?q=${encodeURIComponent(value)}`,
    );
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[85vh] lg:min-h-[80vh] flex-col pt-40 lg:pt-48 pb-20 lg:pb-28 text-white"
    >
      <div className="relative z-10 w-full max-w-[86rem] mx-auto px-5 lg:px-10">
        {/* Main hero: side-by-side on desktop, stacked on mobile */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:gap-20">
          {/* Left: text + search */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1
              className="font-anybody font-bold uppercase text-white"
              style={{
                fontSize: "clamp(34px, 6vw, 84px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {t("landing.heroTitle")}
            </h1>

            <p className="hidden md:block mt-6 max-w-lg text-[15px] text-white/60">
              {t("landing.heroDesc")}
            </p>

            <div className="mt-10 w-full max-w-[680px]">
              <form
                onSubmit={submit}
                className="flex items-center gap-3 rounded-3xl bg-white px-5 py-6 sm:px-6 sm:py-4"
              >
                <Search size={24} className="shrink-0 text-black/50 sm:size-5" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={phText}
                  className="flex-1 min-w-0 bg-transparent text-base text-black placeholder:text-black/50 outline-none sm:text-[15px]"
                  aria-label={t("landing.heroSearchPlaceholder")}
                />
                <button
                  type="submit"
                  aria-label={t("landing.heroSearchSubmit")}
                  className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 sm:w-10 sm:h-10"
                  style={{ background: "var(--color-voltage-lime)", color: "var(--color-carbon-ink)" }}
                >
                  <ArrowRight size={22} strokeWidth={2.5} className="sm:size-5" />
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => chip(c)}
                    className="text-[11px] sm:text-[12px] text-white/55 border border-white/15 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-1 transition-colors hover:text-white hover:border-white/35"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: hero visual (desktop only) */}
          <div className="relative hidden min-h-[360px] items-center justify-center lg:flex">
            <div className="relative w-full max-w-md">
              {/* Single subtle decorative ring */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ width: 520, height: 520 }} />

              {/* Main image card */}
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-voltage-lime/20 bg-white/5 shadow-2xl transition-transform duration-700 hover:rotate-0 lg:rotate-3">
                <Image
                  src="/hero-care.jpg"
                  alt="A licensed physiotherapist guiding a patient through exercises in a warm Nepali home"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 1024px) 0px, 480px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-ink/60 via-transparent to-transparent" />
              </div>

              {/* Floating NMC verified card */}
              <div className="absolute -right-4 top-6 z-20 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/90 p-2.5 pr-3.5 shadow-xl backdrop-blur-sm">
                <div className="grid size-8 place-items-center rounded-lg bg-voltage-lime/10 text-voltage-lime">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] text-ash">{t("landing.heroCertifiedProfessionals")}</p>
                  <p className="text-xs font-semibold text-carbon-ink">{t("landing.heroNmcVerifiedCare")}</p>
                </div>
              </div>

              {/* Floating rating card */}
              <div className="absolute -left-4 bottom-4 z-20 flex items-center gap-3 rounded-2xl bg-voltage-lime p-4 shadow-xl sm:-left-6 sm:bottom-6">
                <div className="flex items-center gap-2 text-carbon-ink">
                  <span className="font-display text-2xl font-semibold">4.8</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-carbon-ink text-carbon-ink" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] leading-tight text-carbon-ink/70 sm:text-xs">{t("landing.heroAvgPatientRating")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available today strip */}
        <div className="mt-28 lg:mt-36 border-t border-white/10 pt-10 lg:pt-12">
          <ErrorBoundary>
            <Suspense fallback={<TherapistCardGridSkeleton count={4}  />}>
              <AvailableToday onBook={onBook} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </section>
  );
}

function AvailableToday({ onBook }: { onBook?: (t: TherapistData) => void }) {
  const { t } = useLang();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["hero-featured-therapists"],
    queryFn: () => getTherapists({ limit: 20 }),
  });

  const therapists: TherapistData[] = useMemo(() => {
    const list = (data?.therapists ?? []).slice(0, 10);
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 4);
  }, [data]);

  if (isLoading) return (
    <>
      <div className="flex items-center justify-between gap-3 pb-4">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/60 flex items-center gap-2 shrink-0">
          <span className="relative flex size-1.5 sm:size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-voltage-lime/75" />
            <span className="relative inline-flex size-1.5 sm:size-2 rounded-full bg-voltage-lime" />
          </span>
          <span className="hidden sm:inline">{t("landing.heroAvailableToday")} · {t("landing.heroRegion")}</span>
          <span className="sm:hidden">{t("landing.heroAvailableToday")}</span>
        </p>
        <button
          onClick={() => router.push("/find-a-therapist")}
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white cursor-pointer shrink-0"
        >
          {t("landing.heroViewAllTherapists")} →
        </button>
      </div>
       <TherapistCardGridSkeleton count={4} variant="dark" gridCount={[2, 4]} />
    </>
  )

  if (therapists.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/60 flex items-center gap-2 shrink-0">
          <span className="relative flex size-1.5 sm:size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-voltage-lime/75" />
            <span className="relative inline-flex size-1.5 sm:size-2 rounded-full bg-voltage-lime" />
          </span>
          <span className="hidden sm:inline">{t("landing.heroAvailableToday")} · {t("landing.heroRegion")}</span>
          <span className="sm:hidden">{t("landing.heroAvailableToday")}</span>
        </p>
        <button
          onClick={() => router.push("/find-a-therapist")}
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white cursor-pointer shrink-0"
        >
          {t("landing.heroViewAllTherapists")} →
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-2.5 text-left transition-colors duration-200 hover:border-voltage-lime/25"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={therapist.name} size={36} src={therapist.mediaUrls?.split(",")[0]} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white truncate">{therapist.name}</div>
                </div>
              </div>
              <div className="text-sm font-bold text-white leading-none shrink-0">
                {npr(therapist.price)}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-white/40 truncate">{therapist.city}</p>
              <div className="flex items-center gap-1 text-xs shrink-0">
                <Star className="w-3 h-3 fill-voltage-lime text-voltage-lime" />
                <span className="font-medium text-white/85">{therapist.rating}</span>
                <span className="text-white/35">({therapist.reviews})</span>
              </div>
            </div>

            <p className="text-xs text-white/40 leading-relaxed truncate">
              {therapist.specialty}
            </p>

            <div className="mt-auto pt-1 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
                <ShieldCheck size={12} className="text-voltage-lime/70" />
                {t("landing.heroNmcVerifiedCare")}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook?.(therapist);
                }}
                className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/75 transition-colors hover:border-voltage-lime/40 hover:text-voltage-lime"
              >
                {t("common.book")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
