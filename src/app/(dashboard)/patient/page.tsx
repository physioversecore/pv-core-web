"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/context/i18n";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StatsSkeleton, CardSkeleton, AppointmentsSkeleton } from "@/components/SuspenseFallback";
import { WelcomeHeader, Statistics, UpcomingAppointments, RateTherapist, ReferFriend } from "./components";

function StatsSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<StatsSkeleton />}>
        <Statistics />
      </Suspense>
    </ErrorBoundary>
  );
}

function ReferSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <ReferFriend />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function Overview() {
  const { t } = useLang();
  const { user } = useAuth();

  return (
    <div>
      <WelcomeHeader name={user!.name} />
      <StatsSection />
      <ErrorBoundary>
        <Suspense fallback={<AppointmentsSkeleton />}>
          <UpcomingAppointments />
        </Suspense>
      </ErrorBoundary>
      <RateTherapist />
      <ReferSection />

      <p className="text-xs text-text-light mt-4">
        {t("patient_dashboard.needBookSession")}{" "}
        <Link href="/patient/sessions" className="text-secondary underline">
          {t("patient_dashboard.goToMySessions")}
        </Link>
        .
      </p>
    </div>
  );
}
