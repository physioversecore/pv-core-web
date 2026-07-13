"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminVerifications,
  approveVerification,
  rejectVerification,
  type AdminVerificationData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminVerificationData[] = [
  { id: "vr-1", therapist: "Bikash Thapa", therapistId: "t5", documentType: "Practice license", uploaded: "2026-07-11", expires: "2028-03-01", status: "Pending review" },
  { id: "vr-2", therapist: "Puja Maharjan", therapistId: "t4", documentType: "Government ID", uploaded: "2026-07-09", expires: null, status: "Pending review" },
  { id: "vr-3", therapist: "Dipesh Rana", therapistId: "t6", documentType: "Certification", uploaded: "2026-07-12", expires: "2027-06-15", status: "Pending review" },
  { id: "vr-4", therapist: "Sujan Karki", therapistId: "t3", documentType: "Practice license", uploaded: "2024-01-10", expires: "2026-08-03", status: "Expiring soon" },
  { id: "vr-5", therapist: "Rajesh Shrestha", therapistId: "t1", documentType: "Certification", uploaded: "2023-05-02", expires: "2026-06-01", status: "Expired" },
  { id: "vr-6", therapist: "Anita Tamang", therapistId: "t2", documentType: "Practice license", uploaded: "2025-02-14", expires: "2029-02-14", status: "Verified" },
];

const QUERY_KEY = "admin-verifications";

interface UseAdminVerificationsParams {
  search: string;
  documentType: string;
  status: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminVerifications(params: UseAdminVerificationsParams) {
  const queryClient = useQueryClient();
  const { search, documentType, status, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, documentType, status, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminVerifications({
        search: search || undefined,
        documentType: documentType || undefined,
        status: status || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, documentType, status, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => rejectVerification(id, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    approveVerif: (id: string) => approveMutation.mutateAsync(id),
    rejectVerif: (id: string, note: string) => rejectMutation.mutateAsync({ id, note }),
  };
}

function useSeedFilter(
  seed: AdminVerificationData[],
  params: { search: string; documentType: string; status: string; sortBy: string; sortOrder: SortDirection },
): AdminVerificationData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.therapist.toLowerCase().includes(q));
  }
  if (params.documentType) {
    result = result.filter((r) => r.documentType === params.documentType);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminVerificationData] ?? "";
      const bVal = b[params.sortBy as keyof AdminVerificationData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }
  return result;
}
