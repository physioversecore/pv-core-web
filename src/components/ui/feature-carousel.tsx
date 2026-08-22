"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { npr } from "@/utils/format";
import { useLang } from "@/context/i18n";
import type { Therapist } from "@/types";
import Image from "next/image";

const UNSPLASH_FALLBACK = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1200",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1200",
  "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?q=80&w=1200",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=1200",
  "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=1200",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200",
];

interface FeatureCarouselProps {
  therapists: Therapist[];
  onBook: (t: Therapist) => void;
  loading?: boolean;
}

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

function CarouselSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto md:p-8">
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-white/10">
        <div className="w-full lg:w-[40%] min-h-[350px] md:min-h-[450px] lg:h-full bg-voltage-lime/40 animate-pulse" />
        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full bg-white/5 border-t lg:border-t-0 lg:border-l border-white/10 items-center justify-center hidden md:flex">
          <div className="w-full max-w-[420px] aspect-[4/5] rounded-[2rem] md:rounded-[2.8rem] bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel({ therapists, onBook, loading }: FeatureCarouselProps) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = therapists;
  const count = slides.length;

  const currentIndex =
    ((step % count) + count) % count;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + count) % count;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused || count <= 1) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, count]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = count;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  if (loading) return <CarouselSkeleton />;
  if (count === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto md:p-8">
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-border/40">

        <div className="hidden lg:flex w-[40%] h-full relative z-30 flex-col items-start justify-center overflow-hidden pl-16 bg-mid-abyss">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-mid-abyss via-mid-abyss/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-mid-abyss via-mid-abyss/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {slides.map((therapist, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(count / 2),
                count / 2,
                distance
              );

              return (
                <motion.div
                  key={therapist.id}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-4 px-6 md:px-10 lg:px-8 py-3.5 md:py-5 lg:py-4 rounded-full transition-all duration-700 text-left group border",
                      isActive
                        ? "bg-voltage-lime text-carbon-ink border-voltage-lime z-10"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white"
                    )}
                  >
                    <span className="font-normal text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {therapist.name}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
          </div>

        <div
          className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full relative bg-secondary/30 flex items-center justify-center py-16 md:py-24 lg:py-16 px-6 md:px-12 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-border/20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
            {slides.map((therapist, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              const photo = therapist.mediaUrls?.split(",")[0];
              const fallback =
                UNSPLASH_FALLBACK[index % UNSPLASH_FALLBACK.length];

              return (
                <motion.div
                  key={therapist.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-2 md:border-4 origin-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="relative w-full h-full">
                    <Image
                      src={photo || fallback}
                      alt={therapist.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={cn(
                        "object-cover transition-all duration-700",
                        isActive
                          ? "grayscale-0 blur-0"
                          : "grayscale blur-[2px] brightness-75"
                      )}
                    />
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 md:p-10 pt-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end"
                      >
                        <div className="bg-background text-foreground px-2 py-1 rounded-full text-[11px] font-normal uppercase tracking-[0.1em] w-fit shadow-lg mb-3 border border-border/50 flex items-center gap-2">
                          <span>{npr(therapist.price)}</span>
                          <span className="text-foreground/40">•</span>
                          <span>per session</span>
                          <span className="text-foreground/40">•</span>
                          <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                            <Star size={12} className="fill-voltage-lime text-voltage-lime" />
                            {therapist.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-end justify-between gap-4 flex-wrap">
                          <p className="text-white font-normal text-xl md:text-2xl leading-tight drop-shadow-md tracking-tight">
                            {therapist.name}
                          </p>
                          <button
                            onClick={() => onBook(therapist)}
                            className="inline-flex items-center gap-2 rounded-full bg-voltage-lime px-6 py-2 text-sm font-semibold text-carbon-ink transition-all hover:-translate-y-0.5 hover:brightness-110 shrink-0"
                          >
                            {t("common.book")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-8 left-8 flex items-center gap-3 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/75 shadow-[0_0_10px_white]" />
                    <span className="text-white/75 text-[10px] font-normal uppercase tracking-[0.3em] font-mono">
                      {therapist.specialty}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
