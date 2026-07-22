"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminServiceAreaData } from "@/services/api/admin";
import {
  getAdminServiceAreas,
  createAdminServiceArea,
  updateAdminServiceArea,
  deleteAdminServiceArea,
  assignTherapistToZone,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

interface UseAdminServiceAreasParams {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminServiceAreas(params: UseAdminServiceAreasParams) {
  const { search, status, sortBy, sortOrder, page, pageSize } = params;

  const [items, setItems] = useState<AdminServiceAreaData[]>([]);
  const [allItems, setAllItems] = useState<AdminServiceAreaData[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const result = await getAdminServiceAreas({
        skip,
        limit: pageSize,
        search: search || undefined,
        status: status || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });
      setItems(result.items);
      setTotal(result.total);

      const allResult = await getAdminServiceAreas({
        limit: 1000,
        search: search || undefined,
        status: status || undefined,
      });
      setAllItems(allResult.items);
    } catch (error) {
      console.error("Failed to fetch service areas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, status, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createArea = useCallback(
    async (data: { name: string; localities: string[]; therapistIds?: string[] }) => {
      await createAdminServiceArea(data);
      await fetchData();
    },
    [fetchData],
  );

  const updateArea = useCallback(
    async (id: string, data: Partial<AdminServiceAreaData>) => {
      await updateAdminServiceArea(id, data);
      await fetchData();
    },
    [fetchData],
  );

  const deleteArea = useCallback(
    async (id: string) => {
      await deleteAdminServiceArea(id);
      await fetchData();
    },
    [fetchData],
  );

  const assignTherapist = useCallback(
    async (zoneId: string, therapistId: string) => {
      await assignTherapistToZone(zoneId, therapistId);
      await fetchData();
    },
    [fetchData],
  );

  return {
    items,
    allItems,
    total,
    isLoading,
    createArea,
    updateArea,
    deleteArea,
    assignTherapist,
  };
}
