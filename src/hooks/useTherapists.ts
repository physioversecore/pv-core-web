"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTherapists } from "@/services/api/therapists";
import type { Therapist } from "@/types";

export function useTherapists() {
  const { data, isRefetching, refetch } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => getTherapists(),
  });

  const therapists: Therapist[] = (data?.therapists ?? []).map((t) => ({
    ...t,
    gender: t.gender as "Male" | "Female",
  }));

  return { therapists, total: data?.total ?? 0, isRefetching, refetch };
}

export function useFilteredTherapists(
  therapists: Therapist[],
  filters: { q?: string; city?: string; spec?: string; gender?: string },
) {
  return useMemo(
    () =>
      therapists.filter(
        (t) =>
          (!filters.q || t.name.toLowerCase().includes(filters.q.toLowerCase()) || t.specialty.toLowerCase().includes(filters.q.toLowerCase())) &&
          (!filters.city || t.city === filters.city) &&
          (!filters.spec || t.specialty === filters.spec) &&
          (!filters.gender || t.gender === filters.gender),
      ),
    [filters.q, filters.city, filters.spec, filters.gender, therapists],
  );
}
