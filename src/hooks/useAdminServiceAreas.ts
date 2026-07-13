"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminServiceAreas,
  createAdminServiceArea,
  updateAdminServiceArea,
  type AdminServiceAreaData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminServiceAreaData[] = [
  { id: "sa-1", name: "Kathmandu Central", localities: ["Baneshwor", "New Baneshwor", "Koteshwor"], assignedTherapists: 4, bookingsThisMonth: 96, status: "Active" },
  { id: "sa-2", name: "Lalitpur", localities: ["Jawalakhel", "Pulchowk", "Kupondole"], assignedTherapists: 3, bookingsThisMonth: 74, status: "Active" },
  { id: "sa-3", name: "Bhaktapur", localities: ["Suryabinayak", "Madhyapur Thimi"], assignedTherapists: 1, bookingsThisMonth: 18, status: "Low coverage" },
  { id: "sa-4", name: "Boudha / Jorpati", localities: ["Boudha", "Jorpati", "Chuchepati"], assignedTherapists: 2, bookingsThisMonth: 41, status: "Active" },
];

const QUERY_KEY = "admin-service-areas";

interface UseAdminServiceAreasParams {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminServiceAreas(params: UseAdminServiceAreasParams) {
  const queryClient = useQueryClient();
  const { search, status, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, status, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminServiceAreas({
        search: search || undefined,
        status: status || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, status, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const createMutation = useMutation({
    mutationFn: (data: { name: string; localities: string[]; therapistIds?: string[] }) =>
      createAdminServiceArea(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminServiceAreaData> }) =>
      updateAdminServiceArea(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    createArea: createMutation.mutateAsync,
    updateArea: (id: string, data: Partial<AdminServiceAreaData>) =>
      updateMutation.mutateAsync({ id, data }),
  };
}

function useSeedFilter(
  seed: AdminServiceAreaData[],
  params: { search: string; status: string; sortBy: string; sortOrder: SortDirection },
): AdminServiceAreaData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.localities.some((l) => l.toLowerCase().includes(q)),
    );
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminServiceAreaData] ?? "";
      const bVal = b[params.sortBy as keyof AdminServiceAreaData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }
  return result;
}
