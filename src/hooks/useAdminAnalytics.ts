"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminAnalyticsStats,
  getBookingsByZone,
  getCancellationRateByTherapist,
  getRevenueTrend,
  type AdminAnalyticsStats,
  type ZoneBookingStat,
  type TherapistCancellationStat,
  type RevenueMonthStat,
} from "@/services/api/admin";

const SEED_STATS: AdminAnalyticsStats = {
  revenueMTD: "Rs 2.4L",
  revenueChange: "18%",
  cancellationRate: "6.2%",
  cancellationChange: "1.1%",
  repeatBookingRate: "61%",
  repeatChange: "4%",
  avgSessionRating: "4.6",
  ratingNote: "Above 4.5 target",
};

const SEED_ZONE: ZoneBookingStat[] = [
  { zone: "Kathmandu Central", bookings: 96 },
  { zone: "Lalitpur", bookings: 74 },
  { zone: "Boudha / Jorpati", bookings: 41 },
  { zone: "Bhaktapur", bookings: 18, isWarning: true },
];

const SEED_CANCELLATION: TherapistCancellationStat[] = [
  { therapist: "Sujan Karki", rate: 14.2, isWarning: true },
  { therapist: "Bikash Thapa", rate: 8.1, isAmber: true },
  { therapist: "Anita Tamang", rate: 3.9 },
  { therapist: "Rajesh Shrestha", rate: 2.6 },
];

const SEED_REVENUE: RevenueMonthStat[] = [
  { month: "Feb", revenue: "Rs 1.5L" },
  { month: "Mar", revenue: "Rs 1.7L" },
  { month: "Apr", revenue: "Rs 1.8L" },
  { month: "May", revenue: "Rs 2.0L" },
  { month: "Jun", revenue: "Rs 2.1L" },
  { month: "Jul MTD", revenue: "Rs 2.4L" },
];

export function useAdminAnalytics(dateRange?: string) {
  const statsQuery = useQuery({
    queryKey: ["admin-analytics-stats", dateRange],
    queryFn: () => getAdminAnalyticsStats(),
    placeholderData: (prev) => prev,
  });

  const zoneQuery = useQuery({
    queryKey: ["admin-analytics-zones", dateRange],
    queryFn: () => getBookingsByZone(dateRange),
    placeholderData: (prev) => prev,
  });

  const cancelQuery = useQuery({
    queryKey: ["admin-analytics-cancellation", dateRange],
    queryFn: () => getCancellationRateByTherapist(dateRange),
    placeholderData: (prev) => prev,
  });

  const revenueQuery = useQuery({
    queryKey: ["admin-analytics-revenue", dateRange],
    queryFn: () => getRevenueTrend(),
    placeholderData: (prev) => prev,
  });

  return {
    stats: statsQuery.data ?? SEED_STATS,
    zones: zoneQuery.data ?? SEED_ZONE,
    cancellation: cancelQuery.data ?? SEED_CANCELLATION,
    revenue: revenueQuery.data ?? SEED_REVENUE,
    isLoading: statsQuery.isLoading || zoneQuery.isLoading || cancelQuery.isLoading || revenueQuery.isLoading,
    isRefetching: statsQuery.isRefetching || zoneQuery.isRefetching || cancelQuery.isRefetching || revenueQuery.isRefetching,
    refetch: () => Promise.all([statsQuery.refetch(), zoneQuery.refetch(), cancelQuery.refetch(), revenueQuery.refetch()]),
  };
}
