"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/context/i18n";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StatsSkeleton, CardSkeleton, AppointmentsSkeleton } from "@/components/SuspenseFallback";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
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
  const { refetch, isRefetching } = usePatientDashboard();

  return (
    <div>
      <div className="flex items-center justify-between">
        <WelcomeHeader name={user!.name} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>
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
