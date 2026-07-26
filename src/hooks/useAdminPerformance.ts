"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPerformance,
  updateAdminPerformance,
  resolveAdminPerformance,
  deleteAdminPerformance,
  scheduleReview,
  removeFromTeam,
  type AdminPerformanceData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminPerformanceData[] = [
  { id: "t1", name: "Rajesh Shrestha", avgRating: 4.8, sessions: 210, reviews: 142, trend: 0.1, linkedComplaints: 0, status: "Good standing" },
  { id: "t2", name: "Anita Tamang", avgRating: 4.6, sessions: 180, reviews: 120, trend: 0.0, linkedComplaints: 1, status: "Good standing" },
  { id: "t5", name: "Bikash Thapa", avgRating: 4.4, sessions: 64, reviews: 41, trend: -0.2, linkedComplaints: 0, status: "Needs review" },
  { id: "t3", name: "Sujan Karki", avgRating: 4.2, sessions: 95, reviews: 77, trend: -0.3, linkedComplaints: 2, status: "Under probation" },
];

const QUERY_KEY = "admin-performance";

interface UseAdminPerformanceParams {
  search: string;
  status: string;
  minRating: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminPerformance(params: UseAdminPerformanceParams) {
  const queryClient = useQueryClient();
  const { search, status, minRating, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, status, minRating, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminPerformance({
        search: search || undefined,
        status: status || undefined,
        minRating: minRating ? Number(minRating) : undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, status, minRating, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminPerformanceData> }) =>
      updateAdminPerformance(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => resolveAdminPerformance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminPerformance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const scheduleReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date: string; adminId: string; notes: string } }) =>
      scheduleReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      removeFromTeam(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    updatePerformance: (id: string, data: Partial<AdminPerformanceData>) =>
      updateMutation.mutateAsync({ id, data }),
    resolvePerformance: (id: string) =>
      resolveMutation.mutateAsync(id),
    deletePerformance: (id: string) =>
      deleteMutation.mutateAsync(id),
    scheduleReview: (id: string, data: { date: string; adminId: string; notes: string }) =>
      scheduleReviewMutation.mutateAsync({ id, data }),
    removeFromTeam: (id: string, reason: string) =>
      removeMutation.mutateAsync({ id, reason }),
  };
}

function useSeedFilter(
  seed: AdminPerformanceData[],
  params: { search: string; status: string; minRating: string; sortBy: string; sortOrder: SortDirection },
): AdminPerformanceData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.name.toLowerCase().includes(q));
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.minRating) {
    const min = Number(params.minRating);
    if (!isNaN(min)) result = result.filter((r) => r.avgRating >= min);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminPerformanceData] ?? "";
      const bVal = b[params.sortBy as keyof AdminPerformanceData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }
  return result;
}
