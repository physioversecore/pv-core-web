"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookingModal } from "@/components/BookingModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { FeaturedTherapistsSkeleton } from "@/components/SuspenseFallback";
import {
  HeroSection,
  PartnersMarquee,
  ImpactStats,
  HowItWorksSection,
  ServicesSection,
  FeaturedTherapists,
  TherapistCTA,
} from "@/components/sections";
import { FeatureCarousel } from "@/components/ui/feature-carousel";
import { Reveal } from "@/components/Reveal";
import { useLang } from "@/context/i18n";
import { useBooking } from "@/hooks/useBooking";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

export default function Landing() {
  const { t } = useLang();
  const { booking, book: handleBook, closeBooking } = useBooking();

  const { data: therapistsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapists", "featured-carousel", 10],
    queryFn: () => getTherapists({ skip: 0, limit: 10 }),
  });

  const therapists: Therapist[] = (therapistsData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  return (
    <div className="overflow-x-hidden">
      <div className="home-background">
        <HeroSection onBook={(t) => handleBook({ ...t, gender: t.gender as Therapist["gender"] })} />
        <div className="max-w-7xl mx-auto px-5 text-center pt-4 pb-2">
          <Reveal>
            <p className="eyebrow !text-voltage-lime mb-3">{t("landing.featuredTherapistsEyebrow")}</p>
            <h2 className="font-display text-heading-sm font-medium leading-snug tracking-[-0.02em] text-white sm:text-2xl">
              {t("landing.featuredTherapistsTitle")}
            </h2>
          </Reveal>
        </div>
        <FeatureCarousel therapists={therapists} onBook={handleBook} loading={isLoading} />
        <ServicesSection />
      </div>
      <PartnersMarquee />
      {/*<ImpactStats />*/}
      <HowItWorksSection />
      {/*{isError ? null : (
        <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          <Suspense fallback={<FeaturedTherapistsSkeleton />}>
            <FeaturedTherapists therapists={therapists.slice(0, 3)} onBook={handleBook} loading={isLoading} />
          </Suspense>
        </ErrorBoundary>
      )}*/}
      <TherapistCTA />
      {booking && <BookingModal therapist={booking} onClose={closeBooking} />}
    </div>
  );
}
