"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminLeaves,
  approveLeave,
  declineLeave,
  type AdminLeaveData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminLeaveData[] = [
  { id: "lv-1", therapist: "Sujan Karki", therapistId: "t3", dateFrom: "2026-07-15", dateTo: "2026-07-16", reason: "Personal", bookingsAffected: 3, status: "Pending" },
  { id: "lv-2", therapist: "Puja Maharjan", therapistId: "t4", dateFrom: "2026-07-18", dateTo: "2026-07-18", reason: "Medical appointment", bookingsAffected: 1, status: "Pending" },
  { id: "lv-3", therapist: "Rajesh Shrestha", therapistId: "t1", dateFrom: "2026-07-20", dateTo: "2026-07-22", reason: "Festival travel", bookingsAffected: 1, status: "Pending" },
  { id: "lv-4", therapist: "Anita Tamang", therapistId: "t2", dateFrom: "2026-07-13", dateTo: "2026-07-13", reason: "Sick leave", bookingsAffected: 2, status: "Approved" },
];

const QUERY_KEY = "admin-leaves";

interface UseAdminLeavesParams {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminLeaves(params: UseAdminLeavesParams) {
  const queryClient = useQueryClient();
  const { search, status, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, status, dateFrom, dateTo, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminLeaves({
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, status, dateFrom, dateTo, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveLeave(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => declineLeave(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    approveLeaveRequest: (id: string) => approveMutation.mutateAsync(id),
    declineLeaveRequest: (id: string, reason?: string) => declineMutation.mutateAsync({ id, reason }),
  };
}

function useSeedFilter(
  seed: AdminLeaveData[],
  params: { search: string; status: string; dateFrom: string; dateTo: string; sortBy: string; sortOrder: SortDirection },
): AdminLeaveData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.therapist.toLowerCase().includes(q));
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
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
