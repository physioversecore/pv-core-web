"use client";

import { Suspense } from "react";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StatsSkeleton, CardSkeleton, AppointmentsSkeleton } from "@/components/SuspenseFallback";
import {
  WelcomeHeader,
  Statistics,
  TodaySessions,
  UploadReport,
  RecentlyUploaded,
  PublicProfile,
  ReferColleague,
} from "./components";

function StatsSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<StatsSkeleton />}>
        <Statistics />
      </Suspense>
    </ErrorBoundary>
  );
}

function TodaySection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppointmentsSkeleton />}>
        <TodaySessions />
      </Suspense>
    </ErrorBoundary>
  );
}

function RecentSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <RecentlyUploaded />
      </Suspense>
    </ErrorBoundary>
  );
}

function ProfileSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <PublicProfile />
      </Suspense>
    </ErrorBoundary>
  );
}

function ReferSection() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <ReferColleague />
      </Suspense>
    </ErrorBoundary>
  );
}

export default function TherapistOverview() {
  const { dashboard } = useTherapistDashboard();

  return (
    <div>
      <WelcomeHeader name={dashboard?.name} />
      <StatsSection />
      <TodaySection />
      <UploadReport />
      <RecentSection />
      <ProfileSection />
      <ReferSection />
    </div>
  );
}
