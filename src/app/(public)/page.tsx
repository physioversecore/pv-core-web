"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookingModal } from "@/components/BookingModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SectionError } from "@/components/SectionError";
import { HeroLiveSkeleton } from "@/components/SuspenseFallback";
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
import { useDebounce } from "@/hooks/useDebounce";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

export default function Landing() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { booking, closeBooking } = useBooking();

  const {
    data: therapistsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const therapists: Therapist[] = (therapistsData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  const debouncedQ = useDebounce(q, 400);

  const hasFilters = !!(debouncedQ || city || spec || gender);

  const handleClearFilters = () => {
    setQ("");
    setCity("");
    setSpec("");
    setGender("");
  };

  const filtered = useMemo(
    () =>
      therapists.filter(
        (t) =>
          (!debouncedQ ||
            t.name.toLowerCase().includes(debouncedQ.toLowerCase()) ||
            t.specialty.toLowerCase().includes(debouncedQ.toLowerCase())) &&
          (!city || t.city === city) &&
          (!spec || t.specialty === spec) &&
          (!gender || t.gender === gender),
      ),
    [debouncedQ, city, spec, gender, therapists],
  );

  return (
    <div className="overflow-x-hidden">
      {isError ? (
        <section className="relative bg-background-dark py-24 px-5">
          <div className="relative max-w-7xl mx-auto">
            <SectionError onRetry={() => refetch()} />
          </div>
        </section>
      ) : (
        <ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          <Suspense fallback={<HeroLiveSkeleton />}>
            <HeroSection
              loading={isLoading}
              q={q}
              city={city}
              spec={spec}
              gender={gender}
              filtered={filtered}
              hasFilters={hasFilters}
              onQChange={setQ}
              onCityChange={setCity}
              onSpecChange={setSpec}
              onGenderChange={setGender}
              onClearFilters={handleClearFilters}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      <PartnersMarquee />
      <HowItWorksSection />
      {/*Service list section*/}
      {/*<ServicesSection />*/}

      {/*Featured therapist top tier list section*/}
      {/*<ErrorBoundary fallback={<SectionError onRetry={() => refetch()} />}>
          <Suspense fallback={<FeaturedTherapistsSkeleton />}>
            <FeaturedTherapists therapists={therapists.slice(0, 3)} onBook={handleBook} loading={isLoading} />
          </Suspense>
        </ErrorBoundary>*/}

      <ImpactStats />
      <TherapistCTA />
      {booking && <BookingModal therapist={booking} onClose={closeBooking} />}
    </div>
  );
}
