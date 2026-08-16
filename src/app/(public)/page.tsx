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
import { useBooking } from "@/hooks/useBooking";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

export default function Landing() {
  const { booking, book: handleBook, closeBooking } = useBooking();

  const { data: therapistsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const therapists: Therapist[] = (therapistsData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  return (
    <div className="overflow-x-hidden">
      <div className="home-background">
        <HeroSection />
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
