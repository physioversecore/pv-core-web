"use client";

import { useQuery } from "@tanstack/react-query";
import { getTherapistPatients } from "@/services/api/patients";
import type { UsePaginationReturn } from "./usePagination";

interface UseTherapistPatientsOptions {
  pagination: UsePaginationReturn;
  search: string;
  condition: string;
  lastVisit: string;
}

export function useTherapistPatients({
  pagination,
  search,
  condition,
  lastVisit,
}: UseTherapistPatientsOptions) {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [
      "therapist-patients",
      pagination.skip,
      pagination.pageSize,
      search,
      condition,
      lastVisit,
    ],
    queryFn: () =>
      getTherapistPatients({
        skip: pagination.skip,
        limit: pagination.pageSize,
        search: search || undefined,
        condition: condition || undefined,
        lastVisit: lastVisit !== "all" ? lastVisit : undefined,
      }),
  });

  return {
    patients: data?.patients ?? [],
    total: data?.total ?? 0,
    isLoading,
    refetch,
    isRefetching,
  };
}
