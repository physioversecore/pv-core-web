"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPatients,
  updateAdminPatient,
  deleteAdminPatient,
  toggleAdminPatientStatus,
  type AdminPatientData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminPatientData[] = [
  { id: "u1", name: "Sita Gurung", city: "Lalitpur", sessions: 12, therapist: "Rajesh Shrestha", therapistId: "t1", joined: "2026-01-15", isActive: true, phone: "9841000001", email: "sita@example.com" },
  { id: "u2", name: "Hari Bahadur Rai", city: "Kathmandu", sessions: 7, therapist: "Rajesh Shrestha", therapistId: "t1", joined: "2026-03-20", isActive: true, phone: "9841000002", email: "hari@example.com" },
  { id: "u3", name: "Nabin Khadka", city: "Kathmandu", sessions: 2, therapist: "Anita Tamang", therapistId: "t2", joined: "2026-06-10", isActive: false, phone: "9841000003", email: "nabin@example.com" },
  { id: "u4", name: "Puja Maharjan", city: "Bhaktapur", sessions: 5, therapist: "Sujan Karki", therapistId: "t3", joined: "2026-04-05", isActive: true, phone: "9841000004", email: "puja@example.com" },
];

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
  });

  const seedFiltered = useSeedFilter(SEED, { search, dateFrom, dateTo, status, city, therapistId, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

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
    items,
    total,
    isLoading: query.isLoading,
    deletePatient: useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]),
    togglePatientStatus: useCallback(
      (id: string, isActive: boolean) => toggleMutation.mutateAsync({ id, isActive }),
      [toggleMutation],
    ),
    updatePatient: useCallback(
      (id: string, data: Partial<AdminPatientData>) => updateMutation.mutateAsync({ id, data }),
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
  seed: AdminPatientData[],
  params: { search: string; dateFrom: string; dateTo: string; status: string; city: string; therapistId?: string; sortBy: string; sortOrder: SortDirection },
): AdminPatientData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.name.toLowerCase().includes(q));
  }
  if (params.status) {
    result = result.filter((r) => (params.status === "Active" ? r.isActive : !r.isActive));
  }
  if (params.city) {
    result = result.filter((r) => r.city === params.city);
  }
  if (params.therapistId) {
    result = result.filter((r) => r.therapistId === params.therapistId);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.joined >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.joined <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminPatientData] ?? "";
      const bVal = b[params.sortBy as keyof AdminPatientData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
