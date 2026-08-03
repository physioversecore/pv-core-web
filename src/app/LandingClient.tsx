"use client";

import { useMemo, useState } from "react";
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

interface LandingClientProps {
  therapists: Therapist[];
}

export default function LandingClient({ therapists }: LandingClientProps) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [gender, setGender] = useState("");
  const { booking, book: handleBook, closeBooking } = useBooking();

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
        filtered={filtered}
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
