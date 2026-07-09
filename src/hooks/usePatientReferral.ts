"use client";

import { useQuery } from "@tanstack/react-query";
import { getPatientReferral } from "@/services/api/patients";

export function usePatientReferral() {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-referral"],
    queryFn: () => getPatientReferral(),
  });

  return {
    referral: data ?? null,
    isLoading,
  };
}
