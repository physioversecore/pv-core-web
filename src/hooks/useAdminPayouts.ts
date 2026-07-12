"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPayouts,
  updateAdminPayout,
  deleteAdminPayout,
  type AdminPayoutData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminPayoutData[] = [
  { id: "PO-201", therapist: "Rajesh Shrestha", therapistId: "t1", amount: 9600, status: "Paid", date: "2026-07-10", sessionsCovered: 8, method: "Bank" },
  { id: "PO-200", therapist: "Anita Tamang", therapistId: "t2", amount: 7200, status: "Paid", date: "2026-07-09", sessionsCovered: 6, method: "Bank" },
  { id: "PO-199", therapist: "Sujan Karki", therapistId: "t3", amount: 4800, status: "Pending", date: "2026-07-08", sessionsCovered: 4, method: "Cash" },
  { id: "PO-198", therapist: "Rajesh Shrestha", therapistId: "t1", amount: 6000, status: "Processing", date: "2026-07-07", sessionsCovered: 5, method: "Bank" },
];

const QUERY_KEY = "admin-payouts";

interface UseAdminPayoutsParams {
  search: string;
  dateFrom: string;
  dateTo: string;
  therapistId: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminPayouts(params: UseAdminPayoutsParams) {
  const queryClient = useQueryClient();
  const { search, dateFrom, dateTo, therapistId, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, dateFrom, dateTo, therapistId, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminPayouts({
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        therapistId: therapistId || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, dateFrom, dateTo, therapistId, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminPayoutData> }) =>
      updateAdminPayout(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    deletePayout: useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]),
    updatePayout: useCallback(
      (id: string, data: Partial<AdminPayoutData>) => updateMutation.mutateAsync({ id, data }),
      [updateMutation],
    ),
    therapists: [
      { id: "t1", name: "Rajesh Shrestha" },
      { id: "t2", name: "Anita Tamang" },
      { id: "t3", name: "Sujan Karki" },
    ],
  };
}

function useSeedFilter(
  seed: AdminPayoutData[],
  params: { search: string; dateFrom: string; dateTo: string; therapistId: string; sortBy: string; sortOrder: SortDirection },
): AdminPayoutData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.therapist.toLowerCase().includes(q));
  }
  if (params.therapistId) {
    result = result.filter((r) => r.therapistId === params.therapistId);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.date >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.date <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminPayoutData] ?? "";
      const bVal = b[params.sortBy as keyof AdminPayoutData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
