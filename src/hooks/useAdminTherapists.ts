"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminTherapists,
  updateAdminTherapist,
  deleteAdminTherapist,
  toggleAdminTherapistStatus,
  type AdminTherapistData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const INITIAL_SEED: AdminTherapistData[] = [
  { id: "t1", name: "Rajesh Shrestha", city: "Lalitpur", specialty: "Sports & post-surgery", rating: 4.9, sessions: 312, status: "Verified", joined: "2025-06-15", isActive: true, phone: "+977-9841234567", email: "rajesh@example.com" },
  { id: "t2", name: "Anita Tamang", city: "Kathmandu", specialty: "Geriatric & neuro", rating: 4.8, sessions: 214, status: "Verified", joined: "2025-08-20", isActive: true, phone: "+977-9851234567", email: "anita@example.com" },
  { id: "t3", name: "Sujan Karki", city: "Bhaktapur", specialty: "Musculoskeletal", rating: 4.7, sessions: 98, status: "Verified", joined: "2025-10-10", isActive: true, phone: "+977-9861234567", email: "sujan@example.com" },
  { id: "t4", name: "Priya Manandhar", city: "Pokhara", specialty: "Pediatric rehab", rating: 4.9, sessions: 187, status: "Verified", joined: "2025-07-05", isActive: true, phone: "+977-9871234567", email: "priya@example.com" },
  { id: "t5", name: "Binod Khatri", city: "Lalitpur", specialty: "Sports injury", rating: 3.8, sessions: 22, status: "Under review", joined: "2026-05-01", isActive: false, phone: "+977-9881234567", email: "binod@example.com" },
];

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

  const [localSeed, setLocalSeed] = useState(INITIAL_SEED);

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
  });

  const seedFiltered = useSeedFilter(localSeed, { search, dateFrom, dateTo, specialty, status, city, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const deleteTherapist = useCallback(
    async (id: string) => {
      try {
        await deleteAdminTherapist(id);
      } catch {
        // API unavailable — continue with local update
      }
      setLocalSeed((prev) => prev.filter((t) => t.id !== id));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  const toggleTherapistStatus = useCallback(
    async (id: string, status: AdminTherapistData["status"]) => {
      try {
        await toggleAdminTherapistStatus(id, status);
      } catch {
        // API unavailable — continue with local update
      }
      setLocalSeed((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status, isActive: status === "Verified" } : t,
        ),
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  const updateTherapist = useCallback(
    async (id: string, data: Partial<AdminTherapistData>) => {
      try {
        await updateAdminTherapist(id, data);
      } catch {
        // API unavailable — continue with local update
      }
      setLocalSeed((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    [queryClient],
  );

  return {
    items,
    total,
    isLoading: query.isLoading,
    deleteTherapist,
    toggleTherapistStatus,
    updateTherapist,
  };
}

function useSeedFilter(
  seed: AdminTherapistData[],
  params: { search: string; dateFrom?: string; dateTo?: string; specialty: string; status: string; city: string; sortBy: string; sortOrder: SortDirection },
): AdminTherapistData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q),
    );
  }
  if (params.specialty) {
    result = result.filter((r) => r.specialty === params.specialty);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.city) {
    result = result.filter((r) => r.city === params.city);
  }
  if (params.dateFrom) {
    const from = params.dateFrom;
    result = result.filter((r) => r.joined >= from);
  }
  if (params.dateTo) {
    const to = params.dateTo;
    result = result.filter((r) => r.joined <= to);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminTherapistData] ?? "";
      const bVal = b[params.sortBy as keyof AdminTherapistData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
