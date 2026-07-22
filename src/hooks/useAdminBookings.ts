"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminBookings,
  type AdminBookingData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const QUERY_KEY = "admin-bookings";

interface UseAdminBookingsParams {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminBookings(params: UseAdminBookingsParams) {
  const { search, status, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, status, dateFrom, dateTo, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminBookings({
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const items: AdminBookingData[] = query.data?.items ?? [];
  const total: number = query.data?.total ?? 0;

  return {
    items,
    total,
    isLoading: query.isLoading,
    error: query.error,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
