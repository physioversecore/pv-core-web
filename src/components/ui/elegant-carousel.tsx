"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { BookButton } from "@/components/common/BookButton";
import { npr } from "@/utils/format";
import { useLang } from "@/context/i18n";
import type { Therapist } from "@/types";

interface ElegantCarouselProps {
  therapists: Therapist[];
  onBook: (t: Therapist) => void;
}

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 800;

export function ElegantCarousel({ therapists, onBook }: ElegantCarouselProps) {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = therapists;
  const count = slides.length;

  const goToSlide = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? "next" : "prev"));
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex],
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % count, "next");
  }, [currentIndex, count, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + count) % count, "prev");
  }, [currentIndex, count, goToSlide]);

  useEffect(() => {
    if (isPaused || count <= 1) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(goNext, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, count, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  if (count === 0) return null;

  const current = slides[currentIndex];
  const photo = current.mediaUrls?.split(",")[0];

  const contentCls = (base: string) =>
    `${base} ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"} transition-all duration-500 ease-out`;

  return (
    <section
      className="relative py-16 lg:py-24 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background accent wash */}
      <div
        className="pointer-events-none absolute inset-0 transition-colors duration-1000"
        style={{
          background:
            "radial-gradient(ellipse 60vw 50vh at 70% 50%, color-mix(in srgb, var(--color-voltage-lime) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        {/* Section header */}
        <div className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-voltage-lime mb-3">
            {t("landing.featuredTherapistsEyebrow")}
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-white tracking-tight">
            {t("landing.featuredTherapistsTitle")}
          </h2>
        </div>

        {/* Carousel body */}
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-10 items-center">
          {/* Left: Text content */}
          <div className="order-2 lg:order-1">
            {/* Slide counter */}
            <div className={contentCls("flex items-center gap-3 mb-6")}>
              <span className="w-8 h-px bg-voltage-lime" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
                {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            {/* Therapist name */}
            <h3
              className={contentCls(
                "font-display text-4xl md:text-5xl xl:text-6xl text-white leading-[1.05] tracking-tight",
              )}
            >
              {current.name}
            </h3>

            {/* Specialty */}
            <p
              className={contentCls("font-mono text-sm uppercase tracking-[0.08em] text-voltage-lime mt-4")}
            >
              {current.specialty}
            </p>

            {/* City + rating */}
            <div className={contentCls("flex items-center gap-4 mt-5")}>
              <span className="text-white/60 text-sm">{current.city}</span>
              <span className="flex items-center gap-1.5 text-sm">
                <Star size={14} className="fill-voltage-lime text-voltage-lime" />
                <span className="font-semibold text-white">{current.rating}</span>
                <span className="text-white/50">({current.reviews})</span>
              </span>
            </div>

            {/* Price */}
            <div className={contentCls("mt-5")}>
              <span className="text-2xl font-bold text-white">{npr(current.price)}</span>
              <span className="text-sm text-white/50 ml-2">{t("therapists.perSession")}</span>
            </div>

            {/* Verified badge + book */}
            <div className={contentCls("flex items-center gap-4 mt-8")}>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-voltage-lime">
                <ShieldCheck size={16} /> {t("find.verified")}
              </span>
              <BookButton onClick={() => onBook(current)} size="sm" />
            </div>

            {/* Nav arrows */}
            <div className={contentCls("flex items-center gap-3 mt-10")}>
              <button
                onClick={goPrev}
                className="w-10 h-10 rounded-full border border-white/15 grid place-items-center text-white/60 transition-colors hover:border-voltage-lime hover:text-voltage-lime"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 rounded-full border border-white/15 grid place-items-center text-white/60 transition-colors hover:border-voltage-lime hover:text-voltage-lime"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right: Image card */}
          <div className="order-1 lg:order-2 relative flex justify-center">
            <div
              className={`relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 ease-out ${
                isTransitioning ? "opacity-0 scale-[0.97]" : "opacity-100 scale-100"
              }`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={current.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-white/5 grid place-items-center">
                  <Avatar name={current.name} size={120} />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Bottom info card */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl text-white">{current.name}</div>
                    <div className="text-xs text-white/60 mt-1">{current.specialty}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={12} className="fill-voltage-lime text-voltage-lime" />
                    <span className="font-semibold text-white">{current.rating}</span>
                  </div>
                </div>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-voltage-lime/40 rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-voltage-lime/40 rounded-br-lg" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-10 flex items-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className="flex-1 group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%",
                    backgroundColor:
                      index === currentIndex ? "var(--color-voltage-lime)" : "rgba(255,255,255,0.25)",
                  }}
                />
              </div>
              <span className="sr-only">{slide.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
