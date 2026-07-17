"use client";

import { useState, useMemo, useCallback } from "react";
import type { AdminServiceAreaData } from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const INITIAL_DATA: AdminServiceAreaData[] = [
  { id: "sa-1", name: "Kathmandu Central", localities: ["Baneshwor", "New Baneshwor", "Koteshwor"], assignedTherapists: 4, bookingsThisMonth: 96, status: "Active" },
  { id: "sa-2", name: "Lalitpur", localities: ["Jawalakhel", "Pulchowk", "Kupondole"], assignedTherapists: 3, bookingsThisMonth: 74, status: "Active" },
  { id: "sa-3", name: "Bhaktapur", localities: ["Suryabinayak", "Madhyapur Thimi"], assignedTherapists: 1, bookingsThisMonth: 18, status: "Low coverage" },
  { id: "sa-4", name: "Boudha / Jorpati", localities: ["Boudha", "Jorpati", "Chuchepati"], assignedTherapists: 2, bookingsThisMonth: 41, status: "Active" },
  { id: "sa-5", name: "Pokhara Lakeside", localities: ["Lakeside", "Begnas", "Rupakot"], assignedTherapists: 3, bookingsThisMonth: 52, status: "Active" },
  { id: "sa-6", name: "Chitwan Narayangarh", localities: ["Narayangarh", "Ratnanagar", "Bachhauli"], assignedTherapists: 2, bookingsThisMonth: 33, status: "Active" },
  { id: "sa-7", name: "Dharan", localities: ["Bhanu Chowk", "Dhankuta Road"], assignedTherapists: 1, bookingsThisMonth: 8, status: "Low coverage" },
];

export const MOCK_THERAPISTS = [
  { id: "t-1", name: "Rajesh Shrestha", specialty: "Orthopedic" },
  { id: "t-2", name: "Anita Tamang", specialty: "Neurological" },
  { id: "t-3", name: "Sujan Karki", specialty: "Pediatric" },
  { id: "t-4", name: "Maya Gurung", specialty: "Sports" },
  { id: "t-5", name: "Deepak Thapa", specialty: "Geriatric" },
  { id: "t-6", name: "Sunita Rai", specialty: "Cardiopulmonary" },
];

interface UseAdminServiceAreasParams {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

function deriveStatus(assignedTherapists: number): "Active" | "Low coverage" {
  return assignedTherapists < 2 ? "Low coverage" : "Active";
}

export function useAdminServiceAreas(params: UseAdminServiceAreasParams) {
  const { search, status, sortBy, sortOrder, page, pageSize } = params;

  const [data, setData] = useState<AdminServiceAreaData[]>(INITIAL_DATA);

  const items = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.localities.some((l) => l.toLowerCase().includes(q)),
      );
    }

    if (status) {
      result = result.filter((r) => r.status === status);
    }

    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy as keyof AdminServiceAreaData] ?? "";
        const bVal = b[sortBy as keyof AdminServiceAreaData] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortOrder === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }, [data, search, status, sortBy, sortOrder]);

  const total = items.length;

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const createArea = useCallback(
    async (form: { name: string; localities: string[]; therapistIds?: string[] }) => {
      const count = form.therapistIds?.length ?? 0;
      const newArea: AdminServiceAreaData = {
        id: `sa-${Date.now()}`,
        name: form.name,
        localities: form.localities,
        assignedTherapists: count,
        bookingsThisMonth: 0,
        status: deriveStatus(count),
      };
      setData((prev) => [newArea, ...prev]);
    },
    [],
  );

  const updateArea = useCallback(async (id: string, partial: Partial<AdminServiceAreaData>) => {
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...partial };
        if (partial.assignedTherapists !== undefined) {
          updated.status = deriveStatus(partial.assignedTherapists);
        }
        return updated;
      }),
    );
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const assignTherapist = useCallback(async (zoneId: string, _therapistId: string) => {
    setData((prev) =>
      prev.map((r) => {
        if (r.id !== zoneId) return r;
        const count = r.assignedTherapists + 1;
        return { ...r, assignedTherapists: count, status: deriveStatus(count) };
      }),
    );
  }, []);

  return {
    items: paginatedItems,
    allItems: data,
    total,
    isLoading: false,
    createArea,
    updateArea,
    deleteArea,
    assignTherapist,
  };
}
