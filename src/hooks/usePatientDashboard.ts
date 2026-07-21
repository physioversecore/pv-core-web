"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientDashboard } from "@/services/api/patients";

export function usePatientDashboard() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["patient-dashboard"],
    queryFn: () => getPatientDashboard(),
  });

  return {
    dashboard: data ?? null,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}
