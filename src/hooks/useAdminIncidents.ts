"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminIncidents,
  escalateIncident,
  resolveIncident,
  type AdminIncidentData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminIncidentData[] = [
  {
    id: "INC-007", reportedBy: "Patient", therapist: "Sujan Karki", patient: "Hari Bahadur Rai",
    severity: "Critical", summary: "Patient reports feeling unsafe, therapist behaving inappropriately mid-session",
    status: "Active", reportedAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: "INC-006", reportedBy: "Therapist", therapist: "Anita Tamang", patient: "Sita Gurung",
    severity: "Medium", summary: "Aggressive family member present at home during session",
    status: "Investigating", reportedAt: "2026-07-10T14:00:00",
  },
  {
    id: "INC-004", reportedBy: "Patient", therapist: "Rajesh Shrestha", patient: "Nabin Khadka",
    severity: "High", summary: "Therapist left session early without explanation",
    status: "Resolved", reportedAt: "2026-07-04T10:00:00",
  },
];

const QUERY_KEY = "admin-incidents";

interface UseAdminIncidentsParams {
  search: string;
  severity: string;
  status: string;
  reportedBy: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminIncidents(params: UseAdminIncidentsParams) {
  const queryClient = useQueryClient();
  const { search, severity, status, reportedBy, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, severity, status, reportedBy, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminIncidents({
        search: search || undefined,
        severity: severity || undefined,
        status: status || undefined,
        reportedBy: reportedBy || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, severity, status, reportedBy, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const escalateMutation = useMutation({
    mutationFn: (id: string) => escalateIncident(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: string }) => resolveIncident(id, outcome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    escalate: (id: string) => escalateMutation.mutateAsync(id),
    resolve: (id: string, outcome: string) => resolveMutation.mutateAsync({ id, outcome }),
  };
}

function useSeedFilter(
  seed: AdminIncidentData[],
  params: { search: string; severity: string; status: string; reportedBy: string; sortBy: string; sortOrder: SortDirection },
): AdminIncidentData[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) => r.therapist.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
    );
  }
  if (params.severity) {
    result = result.filter((r) => r.severity === params.severity);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.reportedBy) {
    result = result.filter((r) => r.reportedBy === params.reportedBy);
  }
  // Active incidents always sort to top
  result.sort((a, b) => {
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (b.status === "Active" && a.status !== "Active") return 1;
    if (params.sortBy) {
      const aVal = a[params.sortBy as keyof AdminIncidentData] ?? "";
      const bVal = b[params.sortBy as keyof AdminIncidentData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    }
    return 0;
  });
  return result;
}
