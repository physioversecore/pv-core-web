"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminRefunds,
  approveRefund as apiApproveRefund,
  denyRefund as apiDenyRefund,
  createAdminRefund,
  createManualCase,
  updateAdminRefund,
  deleteAdminRefund,
  assignRefund as apiAssignRefund,
  type AdminRefundData,
  type AdminCreateRefundPayload,
  type ManualCasePayload,
  type RefundReason,
  type RefundStatus,
} from "@/services/api/admin";

export type { RefundReason, RefundStatus };
export type RefundItem = AdminRefundData;

const QUERY_KEY = "admin-refunds";

export function useCreateManualCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualCasePayload) => createManualCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
    },
  });
}

export function useAdminRefunds(params: {
  search: string;
  reason: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}) {
  const queryClient = useQueryClient();
  const skip = (params.page - 1) * params.pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, {
      search: params.search, reason: params.reason, status: params.status,
      dateFrom: params.dateFrom, dateTo: params.dateTo,
      sortBy: params.sortBy, sortOrder: params.sortOrder, skip, pageSize: params.pageSize,
    }],
    queryFn: () => getAdminRefunds({
      skip,
      limit: params.pageSize,
      search: params.search || undefined,
      reason: params.reason || undefined,
      status: params.status || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      sortBy: params.sortBy || undefined,
      sortOrder: params.sortOrder,
    }),
    placeholderData: (prev) => prev,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiApproveRefund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const denyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiDenyRefund(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminRefundData> }) => updateAdminRefund(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminRefund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: AdminCreateRefundPayload) => createAdminRefund(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const createManualCaseMutation = useMutation({
    mutationFn: (data: ManualCasePayload) => createManualCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => apiAssignRefund(id, assigneeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    createRefund: (data: AdminCreateRefundPayload) => createMutation.mutateAsync(data),
    approveRefund: (id: string) => approveMutation.mutateAsync(id),
    denyRefund: (id: string, reason: string) => denyMutation.mutateAsync({ id, reason }),
    updateRefund: (id: string, data: Partial<AdminRefundData>) => updateMutation.mutateAsync({ id, data }),
    deleteRefund: (id: string) => deleteMutation.mutateAsync(id),
    createManualCase: (data: ManualCasePayload) => createManualCaseMutation.mutateAsync(data),
    assignRefund: (id: string, assigneeId: string) => assignMutation.mutateAsync({ id, assigneeId }),
  };
}
