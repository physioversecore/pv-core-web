"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPatients,
  updateAdminPatient,
  deleteAdminPatient,
  toggleAdminPatientStatus,
  type AdminPatientData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const QUERY_KEY = "admin-patients";

interface UseAdminPatientsParams {
  search: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  city: string;
  therapistId?: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminPatients(params: UseAdminPatientsParams) {
  const queryClient = useQueryClient();
  const { search, dateFrom, dateTo, status, city, therapistId, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, dateFrom, dateTo, status, city, therapistId, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminPatients({
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: status || undefined,
        city: city || undefined,
        therapistId: therapistId || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPatient,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminPatientStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminPatientData> }) =>
      updateAdminPatient(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error as Error | null,
    refetch: query.refetch,
    deletePatient: useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]),
    togglePatientStatus: useCallback(
      (id: string, isActive: boolean) => toggleMutation.mutateAsync({ id, isActive }),
      [toggleMutation],
    ),
    updatePatient: useCallback(
      (id: string, data: Partial<AdminPatientData>) => updateMutation.mutateAsync({ id, data }),
      [updateMutation],
    ),
  };
}
