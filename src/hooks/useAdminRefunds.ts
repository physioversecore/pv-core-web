"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRefunds,
  approveRefund,
  denyRefund,
  type AdminRefundData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminRefundData[] = [
  { id: "RFD-021", patient: "Sita Gurung", patientId: "u1", bookingId: "BKG-1108", amount: 1200, reason: "Cancellation", status: "Pending", filed: "2026-07-13" },
  { id: "RFD-020", patient: "Hari Bahadur Rai", patientId: "u2", bookingId: "BKG-1075", amount: 500, reason: "Service quality", status: "Pending", filed: "2026-07-11" },
  { id: "RFD-018", patient: "Puja Maharjan", patientId: "u4", bookingId: "BKG-0991", amount: 1200, reason: "No-show", status: "Approved", filed: "2026-07-09", resolvedAt: "2026-07-10" },
  { id: "RFD-015", patient: "Nabin Khadka", patientId: "u3", bookingId: "BKG-0940", amount: 300, reason: "Double charge", status: "Denied", filed: "2026-07-06", resolvedAt: "2026-07-07", denyReason: "Transaction was not duplicated" },
];

const QUERY_KEY = "admin-refunds";

interface UseAdminRefundsParams {
  search: string;
  reason: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminRefunds(params: UseAdminRefundsParams) {
  const queryClient = useQueryClient();
  const { search, reason, status, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, reason, status, dateFrom, dateTo, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminRefunds({
        search: search || undefined,
        reason: reason || undefined,
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

  const seedFiltered = useSeedFilter(SEED, { search, reason, status, dateFrom, dateTo, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const approveMutation = useMutation({
    mutationFn: approveRefund,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const denyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => denyRefund(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    approveRefund: useCallback((id: string) => approveMutation.mutateAsync(id), [approveMutation]),
    denyRefund: useCallback(
      (id: string, reason: string) => denyMutation.mutateAsync({ id, reason }),
      [denyMutation],
    ),
  };
}

function useSeedFilter(
  seed: AdminRefundData[],
  params: { search: string; reason: string; status: string; dateFrom: string; dateTo: string; sortBy: string; sortOrder: SortDirection },
): AdminRefundData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) => r.patient.toLowerCase().includes(q) || r.bookingId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
    );
  }
  if (params.reason) {
    result = result.filter((r) => r.reason === params.reason);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.filed >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.filed <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminRefundData] ?? "";
      const bVal = b[params.sortBy as keyof AdminRefundData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
