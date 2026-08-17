"use client";

import { useQuery } from "@tanstack/react-query";
import { getClinics } from "@/services/api/clinics";

const PAGE_SIZE = 9;

export function useClinics(params?: { search?: string; city?: string; page?: number }) {
  const page = params?.page ?? 1;
  const skip = (page - 1) * PAGE_SIZE;

  return useQuery({
    queryKey: ["clinics", page, params?.search ?? "", params?.city ?? ""],
    queryFn: () =>
      getClinics({
        skip,
        limit: PAGE_SIZE,
        search: params?.search || undefined,
        city: params?.city || undefined,
      }),
  });
}
