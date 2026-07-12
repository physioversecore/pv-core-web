"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTherapists,
  updateAdminTherapist,
  deleteAdminTherapist,
  toggleAdminTherapistStatus,
  type AdminTherapistData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminTherapistData[] = [
  { id: "t1", name: "Rajesh Shrestha", city: "Lalitpur", specialty: "Sports & post-surgery", rating: 4.9, sessions: 312, status: "Verified", joined: "2025-06-15", isActive: true },
  { id: "t2", name: "Anita Tamang", city: "Kathmandu", specialty: "Geriatric & neuro", rating: 4.8, sessions: 214, status: "Verified", joined: "2025-08-20", isActive: true },
  { id: "t3", name: "Sujan Karki", city: "Bhaktapur", specialty: "Musculoskeletal", rating: 4.7, sessions: 98, status: "Verified", joined: "2025-10-10", isActive: true },
  { id: "t4", name: "Priya Manandhar", city: "Pokhara", specialty: "Pediatric rehab", rating: 4.9, sessions: 187, status: "Verified", joined: "2025-07-05", isActive: true },
  { id: "t5", name: "Binod Khatri", city: "Lalitpur", specialty: "Sports injury", rating: 3.8, sessions: 22, status: "Under review", joined: "2026-05-01", isActive: false },
];

const QUERY_KEY = "admin-therapists";

interface UseAdminTherapistsParams {
  search: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminTherapists(params: UseAdminTherapistsParams) {
  const queryClient = useQueryClient();
  const { search, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, dateFrom, dateTo, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminTherapists({
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, dateFrom, dateTo, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const deleteMutation = useMutation({
    mutationFn: deleteAdminTherapist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminTherapistData["status"] }) =>
      toggleAdminTherapistStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminTherapistData> }) =>
      updateAdminTherapist(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    deleteTherapist: useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]),
    toggleTherapistStatus: useCallback(
      (id: string, status: AdminTherapistData["status"]) => toggleMutation.mutateAsync({ id, status }),
      [toggleMutation],
    ),
    updateTherapist: useCallback(
      (id: string, data: Partial<AdminTherapistData>) => updateMutation.mutateAsync({ id, data }),
      [updateMutation],
    ),
  };
}

function useSeedFilter(
  seed: AdminTherapistData[],
  params: { search: string; dateFrom: string; dateTo: string; sortBy: string; sortOrder: SortDirection },
): AdminTherapistData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.name.toLowerCase().includes(q));
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.joined >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.joined <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminTherapistData] ?? "";
      const bVal = b[params.sortBy as keyof AdminTherapistData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
