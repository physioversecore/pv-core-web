"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookingModal } from "@/components/BookingModal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  HeroSection,
  PartnersMarquee,
  ImpactStats,
  HowItWorksSection,
  ServicesSection,
  FeaturedTherapists,
  FindTherapistSection,
  AppDownloadSection,
  TherapistCTA,
} from "@/components/sections";
import { useBooking } from "@/hooks/useBooking";
import type { Therapist } from "@/types";
import { getTherapists } from "@/services/api/therapists";

export default function Landing() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { booking, book: handleBook, closeBooking } = useBooking();

  const { data: therapistsData } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const therapists: Therapist[] = (therapistsData?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  const filtered = useMemo(
    () =>
      therapists.filter(
        (t) =>
          (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.specialty.toLowerCase().includes(q.toLowerCase())) &&
          (!city || t.city === city) &&
          (!spec || t.specialty === spec) &&
          (!gender || t.gender === gender),
      ),
    [q, city, spec, gender, therapists],
  );

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      <SiteHeader variant="hero" />
      <HeroSection therapists={therapists} onBook={handleBook} />
      <PartnersMarquee />
      <ImpactStats />
      <HowItWorksSection />
      <ServicesSection />
      <FeaturedTherapists therapists={therapists.slice(0, 3)} onBook={handleBook} />
      <FindTherapistSection
        q={q} city={city} spec={spec} gender={gender}
        filtered={filtered.slice(0, 6)}
        hasMore={filtered.length > 6}
        onQChange={setQ}
        onCityChange={setCity}
        onSpecChange={setSpec}
        onGenderChange={setGender}
        onBook={handleBook}
      />
      <AppDownloadSection />
      <TherapistCTA />
      <SiteFooter />
      {booking && <BookingModal therapist={booking} onClose={closeBooking} />}
    </div>
  );
}
