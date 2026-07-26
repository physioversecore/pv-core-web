"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientReports, type ReportData } from "@/services/api/reports";

export function usePatientReports() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["patient-reports"],
    queryFn: () => getPatientReports(),
  });

  return {
    reports: data ?? [],
    isLoading,
    refetch,
    isRefetching,
  };
}
