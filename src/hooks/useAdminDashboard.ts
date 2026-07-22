"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardStats,
  getAdminDashboardEarnings,
  getAdminRecentActivity,
  getAdminTherapists,
  getAdminBookings,
  getAdminPatients,
  type AdminBookingData,
} from "@/services/api/admin";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export interface AdminDashboardStats {
  totalTherapists: number;
  totalPatients: number;
  sessionsThisWeek: number;
  pendingVerifications: number;
}

export interface AdminDashboardEarnings {
  platformEarnings: number;
  description: string;
}

export interface AdminDashboardActivity {
  id: string;
  patientName: string;
  therapistName: string;
  type: string;
  timestamp: string;
  timeAgo: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStats(raw: any): AdminDashboardStats | null {
  if (!raw || typeof raw !== "object") return null;
  const totalTherapists = raw.totalTherapists ?? raw.total_therapists;
  const totalPatients = raw.totalPatients ?? raw.total_patients;
  const sessionsThisWeek = raw.sessionsThisWeek ?? raw.sessions_this_week;
  const pendingVerifications = raw.pendingVerifications ?? raw.pending_verifications;
  if (totalTherapists == null || totalPatients == null || sessionsThisWeek == null || pendingVerifications == null)
    return null;
  return { totalTherapists, totalPatients, sessionsThisWeek, pendingVerifications };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEarnings(raw: any): AdminDashboardEarnings | null {
  if (!raw || typeof raw !== "object") return null;
  const platformEarnings = raw.platformEarnings ?? raw.platform_earnings;
  if (platformEarnings == null) return null;
  return { platformEarnings, description: raw.description ?? "" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeActivity(raw: any): AdminDashboardActivity[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a) => ({
    id: a.id ?? "",
    patientName: a.patientName ?? a.patient_name ?? "",
    therapistName: a.therapistName ?? a.therapist_name ?? "",
    type: a.type ?? "booked",
    timestamp: a.timestamp ?? "",
    timeAgo: timeAgo(a.timestamp ?? ""),
  }));
}

export function useAdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 60_000,
  });

  const earningsQuery = useQuery({
    queryKey: ["admin-dashboard-earnings"],
    queryFn: getAdminDashboardEarnings,
    staleTime: 60_000,
  });

  const activityQuery = useQuery({
    queryKey: ["admin-dashboard-activity"],
    queryFn: () => getAdminRecentActivity(10),
    staleTime: 30_000,
  });

  const pendingQuery = useQuery({
    queryKey: ["admin-dashboard-pending"],
    queryFn: () => getAdminTherapists({ status: "PENDING", limit: 5 }),
    staleTime: 60_000,
  });

  const recentBookingsQuery = useQuery({
    queryKey: ["admin-dashboard-recent-bookings"],
    queryFn: () => getAdminBookings({ limit: 10, sortBy: "date", sortOrder: "desc" }),
    staleTime: 30_000,
  });

  const stats = normalizeStats(statsQuery.data);
  const earnings = normalizeEarnings(earningsQuery.data);
  const activity = normalizeActivity(activityQuery.data);
  const pendingTherapists = pendingQuery.data?.items ?? [];
  const recentBookings: AdminBookingData[] = recentBookingsQuery.data?.items ?? [];

  return {
    stats,
    earnings,
    activity,
    pendingTherapists,
    recentBookings,
    statsLoading: statsQuery.isLoading,
    earningsLoading: earningsQuery.isLoading,
    activityLoading: activityQuery.isLoading,
    pendingLoading: pendingQuery.isLoading,
    bookingsLoading: recentBookingsQuery.isLoading,
    isLoading: statsQuery.isLoading || earningsQuery.isLoading || activityQuery.isLoading || pendingQuery.isLoading,
    isRefetching:
      statsQuery.isRefetching || earningsQuery.isRefetching || activityQuery.isRefetching || pendingQuery.isRefetching,
    refetch: () =>
      Promise.all([
        statsQuery.refetch(),
        earningsQuery.refetch(),
        activityQuery.refetch(),
        pendingQuery.refetch(),
        recentBookingsQuery.refetch(),
      ]),
  };
}
