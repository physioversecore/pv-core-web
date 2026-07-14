"use client";

import { useQuery } from "@tanstack/react-query";
import { getTherapistDashboard } from "@/services/api/therapists";

export function useTherapistDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["therapist-dashboard"],
    queryFn: () => getTherapistDashboard(),
  });

  return {
    dashboard: data ?? null,
    isLoading,
    error,
  };
}
