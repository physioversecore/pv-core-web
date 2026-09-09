"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPointBalance,
  getPointTransactions,
  getReferralSummary,
  applyPointsToSession,
} from "@/services/api/points";

const BALANCE_KEY = "points-balance";
const LEDGER_KEY = "points-transactions";
const REFERRALS_KEY = "points-referrals";

export function usePointBalance() {
  const query = useQuery({
    queryKey: [BALANCE_KEY],
    queryFn: () => getPointBalance(),
  });

  return {
    balance: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePointTransactions(limit = 20) {
  const query = useQuery({
    queryKey: [LEDGER_KEY, limit],
    queryFn: () => getPointTransactions({ limit }),
  });

  return {
    transactions: query.data?.transactions ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
  };
}

export function useReferralSummary() {
  const query = useQuery({
    queryKey: [REFERRALS_KEY],
    queryFn: () => getReferralSummary(),
  });

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
  };
}

/**
 * Redeeming changes the balance and writes a ledger row, so both are
 * invalidated on success.
 */
export function useApplyPoints() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ sessionId, points }: { sessionId: string; points: number }) =>
      applyPointsToSession(sessionId, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BALANCE_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEDGER_KEY] });
    },
  });

  const applyPoints = useCallback(
    (sessionId: string, points: number) =>
      mutation.mutateAsync({ sessionId, points }),
    [mutation],
  );

  return { applyPoints, isApplying: mutation.isPending };
}
