"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminComplaints,
  updateAdminComplaint,
  type AdminComplaintData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED_PATIENT: AdminComplaintData[] = [
  {
    id: "CMP-041", type: "patient", complainant: "Nabin Khadka", complainantId: "p1",
    against: "Rajesh Shrestha", againstId: "t1", category: "Late arrival",
    priority: "Normal", status: "Open", filed: "2026-07-12T10:30:00",
    description: "Therapist arrived 40 minutes late to the scheduled home visit session. No prior通知 was given.",
    bookingId: "BKG-1042",
  },
  {
    id: "CMP-039", type: "patient", complainant: "Puja Maharjan", complainantId: "p2",
    against: "Sujan Karki", againstId: "t3", category: "Unprofessional conduct",
    priority: "Urgent", status: "Under review", filed: "2026-07-10T14:15:00",
    description: "Therapist made inappropriate comments during the session. Felt uncomfortable and unsafe.",
    bookingId: "BKG-1018",
    notes: ["Assigned to senior admin", "Awaiting therapist response"],
  },
  {
    id: "CMP-035", type: "patient", complainant: "Hari Bahadur Rai", complainantId: "p3",
    against: "Anita Tamang", againstId: "t2", category: "Billing dispute",
    priority: "Normal", status: "Resolved", filed: "2026-07-06T09:00:00",
    description: "Charged Rs 2,500 instead of the agreed Rs 2,000 for the session. Requesting refund of difference.",
    bookingId: "BKG-0995",
    notes: ["Refund of Rs 500 processed", "Patient confirmed resolution"],
  },
];

const SEED_THERAPIST: AdminComplaintData[] = [
  {
    id: "CMT-018", type: "therapist", complainant: "Sujan Karki", complainantId: "t3",
    against: "Hari Bahadur Rai", againstId: "p3", category: "Repeated no-shows",
    priority: "Normal", status: "Under review", filed: "2026-07-12T07:00:00",
    description: "Patient has missed 3 consecutive sessions without prior notice. Wasting therapist travel time.",
    bookingId: "BKG-1035",
    notes: ["Patient notified via SMS"],
  },
  {
    id: "CMT-014", type: "therapist", complainant: "Anita Tamang", complainantId: "t2",
    against: "Sita Gurung", againstId: "p4", category: "Safety concern at home",
    priority: "Urgent", status: "Open", filed: "2026-07-09T11:30:00",
    description: "Unsafe conditions observed at patient's home — loose flooring, no handrails. Risk of falls during session.",
    bookingId: "BKG-1010",
  },
];

const QUERY_KEY = "admin-complaints";

interface UseAdminComplaintsParams {
  type: "patient" | "therapist";
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminComplaints(params: UseAdminComplaintsParams) {
  const queryClient = useQueryClient();
  const { type, search, status, dateFrom, dateTo, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { type, search, status, dateFrom, dateTo, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminComplaints({
        type,
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedData = type === "patient" ? SEED_PATIENT : SEED_THERAPIST;
  const seedFiltered = useSeedFilter(seedData, { search, status, dateFrom, dateTo, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminComplaintData> }) =>
      updateAdminComplaint(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    updateComplaint: (id: string, data: Partial<AdminComplaintData>) =>
      updateMutation.mutateAsync({ id, data }),
  };
}

function useSeedFilter(
  seed: AdminComplaintData[],
  params: { search: string; status: string; dateFrom: string; dateTo: string; sortBy: string; sortOrder: SortDirection },
): AdminComplaintData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.complainant.toLowerCase().includes(q) || r.against.toLowerCase().includes(q));
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
      const aVal = a[params.sortBy as keyof AdminComplaintData] ?? "";
      const bVal = b[params.sortBy as keyof AdminComplaintData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
