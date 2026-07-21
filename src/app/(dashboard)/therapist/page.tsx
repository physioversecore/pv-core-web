"use client";

import { Suspense } from "react";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
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
  const { dashboard, refetch, isRefetching } = useTherapistDashboard();

  return (
    <div>
      <div className="flex items-center justify-between">
        <WelcomeHeader name={dashboard?.name} />
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>
      <StatsSection />
      <TodaySection />
      <UploadReport />
      <RecentSection />
      <ProfileSection />
      <ReferSection />
    </div>
  );
}
