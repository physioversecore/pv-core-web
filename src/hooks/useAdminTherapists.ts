"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTherapists,
  updateAdminTherapist,
  deleteAdminTherapist,
  toggleAdminTherapistStatus,
  type AdminTherapistData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const QUERY_KEY = "admin-therapists";

interface UseAdminTherapistsParams {
  search: string;
  dateFrom?: string;
  dateTo?: string;
  specialty: string;
  status: string;
  city: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminTherapists(params: UseAdminTherapistsParams) {
  const queryClient = useQueryClient();
  const { search, dateFrom, dateTo, specialty, status, city, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, dateFrom, dateTo, specialty, status, city, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminTherapists({
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        specialty: specialty || undefined,
        status: status || undefined,
        city: city || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const deleteTherapist = useCallback(
    async (id: string) => {
      await deleteAdminTherapist(id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  const toggleTherapistStatus = useCallback(
    async (id: string, status: AdminTherapistData["status"]) => {
      await toggleAdminTherapistStatus(id, status);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  const updateTherapist = useCallback(
    async (id: string, data: Partial<AdminTherapistData>) => {
      await updateAdminTherapist(id, data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error as Error | null,
    refetch: query.refetch,
    deleteTherapist,
    toggleTherapistStatus,
    updateTherapist,
  };
}
