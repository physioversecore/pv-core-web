"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminActivityLog,
  type AdminActivityLogEntry,
} from "@/services/api/admin";

const SEED: AdminActivityLogEntry[] = [
  { id: "al-1", timestamp: new Date(new Date().setHours(10, 32, 0)).toISOString(), actor: "Admin User", actorId: "a1", actionType: "Therapist removed", description: "Removed therapist — Sujan Karki. Reason: repeated sub-threshold ratings (4.2 avg) and 2 unresolved complaints." },
  { id: "al-2", timestamp: new Date(new Date().setHours(9, 10, 0)).toISOString(), actor: "Roshani Sharma", actorId: "a2", actionType: "Complaint resolved", description: "Resolved complaint — CMP-035 (Hari Bahadur Rai vs Anita Tamang). Refunded Rs 500 to patient, marked resolved." },
  { id: "al-3", timestamp: new Date(new Date().setHours(8, 45, 0)).toISOString(), actor: "Admin User", actorId: "a1", actionType: "Performance review", description: "Scheduled performance review — Bikash Thapa, following rating drop to 4.4." },
  { id: "al-4", timestamp: new Date(Date.now() - 86400000 + 18 * 3600000).toISOString(), actor: "System", actorId: null, actionType: "Payout run", description: "Ran weekly payout — 12 therapists, Rs 1.8L total, automated job." },
  { id: "al-5", timestamp: "2026-07-10T10:00:00", actor: "Admin User", actorId: "a1", actionType: "Role changed", description: "Changed role — Roshani Sharma: Support Admin → Support Admin (permissions updated: added complaint escalation)." },
  { id: "al-6", timestamp: "2026-07-09T14:00:00", actor: "Bikash Karki", actorId: "a3", actionType: "Refund issued", description: "Issued refund — Rs 1,200 to Puja Maharjan for cancelled session BKG-0991." },
];

const QUERY_KEY = "admin-activity-log";

interface UseAdminActivityLogParams {
  search: string;
  adminId: string;
  actionType: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

export function useAdminActivityLog(params: UseAdminActivityLogParams) {
  const { search, adminId, actionType, dateFrom, dateTo, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, adminId, actionType, dateFrom, dateTo, skip, pageSize }],
    queryFn: () =>
      getAdminActivityLog({
        search: search || undefined,
        adminId: adminId || undefined,
        actionType: actionType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { search, adminId, actionType, dateFrom, dateTo });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  return { items, total, isLoading: query.isLoading, isRefetching: query.isRefetching, refetch: query.refetch };
}

function useSeedFilter(
  seed: AdminActivityLogEntry[],
  params: { search: string; adminId: string; actionType: string; dateFrom: string; dateTo: string },
): AdminActivityLogEntry[] {
  let result = [...seed];
  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) => r.actor.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.id.toLowerCase().includes(q),
    );
  }
  if (params.adminId) {
    result = result.filter((r) => r.actorId === params.adminId);
  }
  if (params.actionType) {
    result = result.filter((r) => r.actionType === params.actionType);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.timestamp >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.timestamp <= params.dateTo + "T23:59:59");
  }
  return result;
}
