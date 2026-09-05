"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminLeaves,
  getAdminLeaveStats,
  approveLeave,
  declineLeave,
  updateLeave,
  deleteLeave,
  type AdminLeaveData,
  type AdminLeaveStats,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminLeaveData[] = [
  { id: "lv-1", therapist: "Sujan Karki", therapistId: "t3", dateFrom: "2026-07-15", dateTo: "2026-07-16", reason: "Personal", bookingsAffected: 3, status: "PENDING" },
  { id: "lv-2", therapist: "Puja Maharjan", therapistId: "t4", dateFrom: "2026-07-18", dateTo: "2026-07-18", reason: "Medical appointment", bookingsAffected: 1, status: "PENDING" },
  { id: "lv-3", therapist: "Rajesh Shrestha", therapistId: "t1", dateFrom: "2026-07-20", dateTo: "2026-07-22", reason: "Festival travel", bookingsAffected: 1, status: "PENDING" },
  { id: "lv-4", therapist: "Anita Tamang", therapistId: "t2", dateFrom: "2026-07-13", dateTo: "2026-07-13", reason: "Sick leave", bookingsAffected: 2, status: "APPROVED" },
  { id: "lv-5", therapist: "Bikash Thapa", therapistId: "t5", dateFrom: "2026-07-15", dateTo: "2026-07-15", reason: "Family event", bookingsAffected: 2, status: "APPROVED" },
  { id: "lv-6", therapist: "Suman Gurung", therapistId: "t6", dateFrom: "2026-07-25", dateTo: "2026-07-27", reason: "Vacation", bookingsAffected: 4, status: "PENDING" },
];

const SEED_STATS: AdminLeaveStats = {
  pending: 4,
  onLeaveToday: 2,
  approvedThisMonth: 6,
  bookingsAffected: 5,
};

const QUERY_KEY = "admin-leaves";

interface UseAdminLeavesParams {
  search: string;
  status: string;
  dateFrom: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminLeaves(params: UseAdminLeavesParams) {
  const queryClient = useQueryClient();
  const { search, status, dateFrom, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, status, dateFrom, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminLeaves({
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, status, dateFrom, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const statsQuery = useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: () => getAdminLeaveStats(),
    placeholderData: (prev) => prev,
  });
  const stats = statsQuery.data ?? SEED_STATS;

  const patchItem = useCallback(
    (updater: (item: AdminLeaveData) => AdminLeaveData) => {
      queryClient.setQueriesData<{ items: AdminLeaveData[]; total: number }>(
        { queryKey: [QUERY_KEY] },
        (old) => {
          if (!old?.items) return old;
          return { ...old, items: old.items.map((item) => updater(item)) };
        },
      );
    },
    [queryClient],
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveLeave(id),
    onSuccess: (updated) => {
      patchItem((item) =>
        item.id === updated.id ? { ...item, status: "APPROVED" as const } : item,
      );
      invalidate();
    },
    onError: () => {
      patchItem((item) => (item.id ? { ...item } : item));
      invalidate();
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineLeave(id, reason),
    onSuccess: (updated) => {
      patchItem((item) =>
        item.id === updated.id ? { ...item, status: "REJECTED" as const } : item,
      );
      invalidate();
    },
    onError: () => {
      patchItem((item) => (item.id ? { ...item } : item));
      invalidate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<AdminLeaveData, "dateFrom" | "dateTo" | "reason">>;
    }) => updateLeave(id, data),
    onSuccess: (updated) => {
      patchItem((item) => (item.id === updated.id ? { ...item, ...updated } : item));
      invalidate();
    },
    onError: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLeave(id),
    onSuccess: () => invalidate(),
    onError: () => invalidate(),
  });

  return {
    items,
    total,
    stats,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    approveLeaveRequest: useCallback(
      (id: string) => approveMutation.mutateAsync(id),
      [approveMutation],
    ),
    declineLeaveRequest: useCallback(
      (id: string, reason?: string) => declineMutation.mutateAsync({ id, reason }),
      [declineMutation],
    ),
    updateLeaveRequest: useCallback(
      (id: string, data: Partial<Pick<AdminLeaveData, "dateFrom" | "dateTo" | "reason">>) =>
        updateMutation.mutateAsync({ id, data }),
      [updateMutation],
    ),
    deleteLeaveRequest: useCallback(
      (id: string) => deleteMutation.mutateAsync(id),
      [deleteMutation],
    ),
  };
}

function useSeedFilter(
  seed: AdminLeaveData[],
  params: { search: string; status: string; dateFrom: string; sortBy: string; sortOrder: SortDirection },
): AdminLeaveData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.therapist.toLowerCase().includes(q));
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.dateFrom <= params.dateFrom && r.dateTo >= params.dateFrom);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminLeaveData] ?? "";
      const bVal = b[params.sortBy as keyof AdminLeaveData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }
  return result;
}
