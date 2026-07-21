"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardStats,
  getAdminDashboardEarnings,
  getAdminRecentActivity,
  getAdminTherapists,
} from "@/services/api/admin";

const FALLBACK_STATS = {
  totalTherapists: 184,
  totalPatients: 1247,
  sessionsThisWeek: 312,
  pendingVerifications: 3,
};

const FALLBACK_EARNINGS = {
  platformEarnings: 542300,
  description: "Platform fees collected this month",
};

const FALLBACK_ACTIVITY = [
  { id: "a1", patientName: "Ramesh A.", therapistName: "Dr. Aarati S.", type: "booked", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: "a2", patientName: "Sita L.", therapistName: "Dr. Bibek T.", type: "rescheduled", timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
  { id: "a3", patientName: "Hari P.", therapistName: "Dr. Rajesh S.", type: "cancelled", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
];

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStats(raw: any) {
  if (!raw || typeof raw !== "object") return FALLBACK_STATS;
  return {
    totalTherapists: raw.totalTherapists ?? raw.total_therapists ?? FALLBACK_STATS.totalTherapists,
    totalPatients: raw.totalPatients ?? raw.total_patients ?? FALLBACK_STATS.totalPatients,
    sessionsThisWeek: raw.sessionsThisWeek ?? raw.sessions_this_week ?? FALLBACK_STATS.sessionsThisWeek,
    pendingVerifications: raw.pendingVerifications ?? raw.pending_verifications ?? FALLBACK_STATS.pendingVerifications,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEarnings(raw: any) {
  if (!raw || typeof raw !== "object") return FALLBACK_EARNINGS;
  return {
    platformEarnings: raw.platformEarnings ?? raw.platform_earnings ?? FALLBACK_EARNINGS.platformEarnings,
    description: raw.description ?? FALLBACK_EARNINGS.description,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeActivity(raw: any): typeof FALLBACK_ACTIVITY {
  if (!Array.isArray(raw)) return FALLBACK_ACTIVITY;
  return raw.map((a) => ({
    id: a.id ?? "",
    patientName: a.patientName ?? a.patient_name ?? "",
    therapistName: a.therapistName ?? a.therapist_name ?? "",
    type: a.type ?? "booked",
    timestamp: a.timestamp ?? "",
  }));
}

export function useAdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const earningsQuery = useQuery({
    queryKey: ["admin-dashboard-earnings"],
    queryFn: getAdminDashboardEarnings,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const activityQuery = useQuery({
    queryKey: ["admin-dashboard-activity"],
    queryFn: () => getAdminRecentActivity(10),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const pendingQuery = useQuery({
    queryKey: ["admin-dashboard-pending"],
    queryFn: () => getAdminTherapists({ status: "PENDING", limit: 5 }),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const stats = normalizeStats(statsQuery.data);
  const earnings = normalizeEarnings(earningsQuery.data);
  const activity = normalizeActivity(activityQuery.data).map((a) => ({
    ...a,
    timeAgo: timeAgo(a.timestamp),
  }));
  const pendingTherapists = pendingQuery.data?.items ?? [];

  return {
    stats,
    earnings,
    activity,
    pendingTherapists,
    isLoading: statsQuery.isLoading || earningsQuery.isLoading || activityQuery.isLoading || pendingQuery.isLoading,
  };
}
