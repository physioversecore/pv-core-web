"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminPaymentStats, type AdminPaymentStats } from "@/services/api/admin";

const QUERY_KEY = "admin-payment-stats";

const FALLBACK: AdminPaymentStats = {
  revenueThisMonth: 240000,
  revenueChangePercent: 18,
  platformCommission: 24000,
  commissionPercent: 10,
  pendingPayouts: 78000,
  pendingPayoutsNote: "Due to therapists Friday",
  disputes: 2,
  disputesNote: "Open refund requests",
};

export function useAdminPaymentStats() {
  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getAdminPaymentStats,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  const stats = query.data ?? FALLBACK;

  return {
    stats,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
