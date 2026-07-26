"use client";

import { useState, useCallback, useMemo } from "react";
import {
  approveLeave,
  declineLeave,
  updateLeave,
  deleteLeave,
  type AdminLeaveData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const INITIAL_SEED: AdminLeaveData[] = [
  { id: "lv-1", therapist: "Sujan Karki", therapistId: "t3", dateFrom: "2026-07-15", dateTo: "2026-07-16", reason: "Personal", bookingsAffected: 3, status: "Pending" },
  { id: "lv-2", therapist: "Puja Maharjan", therapistId: "t4", dateFrom: "2026-07-18", dateTo: "2026-07-18", reason: "Medical appointment", bookingsAffected: 1, status: "Pending" },
  { id: "lv-3", therapist: "Rajesh Shrestha", therapistId: "t1", dateFrom: "2026-07-20", dateTo: "2026-07-22", reason: "Festival travel", bookingsAffected: 1, status: "Pending" },
  { id: "lv-4", therapist: "Anita Tamang", therapistId: "t2", dateFrom: "2026-07-13", dateTo: "2026-07-13", reason: "Sick leave", bookingsAffected: 2, status: "Approved" },
  { id: "lv-5", therapist: "Bikash Thapa", therapistId: "t5", dateFrom: "2026-07-15", dateTo: "2026-07-15", reason: "Family event", bookingsAffected: 2, status: "Approved" },
  { id: "lv-6", therapist: "Suman Gurung", therapistId: "t6", dateFrom: "2026-07-25", dateTo: "2026-07-27", reason: "Vacation", bookingsAffected: 4, status: "Pending" },
];

interface UseAdminLeavesParams {
  search: string;
  status: string;
  dateFrom: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminLeaves(params: UseAdminLeavesParams) {
  const { search, status, dateFrom, sortBy, sortOrder, page, pageSize } = params;
  const [seed, setSeed] = useState<AdminLeaveData[]>(INITIAL_SEED);

  const filtered = useMemo(() => {
    let result = [...seed];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.therapist.toLowerCase().includes(q));
    }
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    if (dateFrom) {
      result = result.filter((r) => r.dateFrom <= dateFrom && r.dateTo >= dateFrom);
    }
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy as keyof AdminLeaveData] ?? "";
        const bVal = b[sortBy as keyof AdminLeaveData] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortOrder === "desc" ? -cmp : cmp;
      });
    }
    return result;
  }, [seed, search, status, dateFrom, sortBy, sortOrder]);

  const skip = (page - 1) * pageSize;
  const items = filtered.slice(skip, skip + pageSize);
  const total = filtered.length;

  const approveLeaveRequest = useCallback(
    async (id: string) => {
      try {
        await approveLeave(id);
      } catch {
        // API unavailable — update mock locally
      }
      setSeed((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r)),
      );
    },
    [],
  );

  const declineLeaveRequest = useCallback(
    async (id: string, reason?: string) => {
      try {
        await declineLeave(id, reason);
      } catch {
        // API unavailable — update mock locally
      }
      setSeed((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Declined" as const } : r)),
      );
    },
    [],
  );

  const updateLeaveRequest = useCallback(
    async (id: string, data: Partial<Pick<AdminLeaveData, "dateFrom" | "dateTo" | "reason">>) => {
      try {
        await updateLeave(id, data);
      } catch {
        // API unavailable — update mock locally
      }
      setSeed((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r)),
      );
    },
    [],
  );

  const deleteLeaveRequest = useCallback(
    async (id: string) => {
      try {
        await deleteLeave(id);
      } catch {
        // API unavailable — update mock locally
      }
      setSeed((prev) => prev.filter((r) => r.id !== id));
    },
    [],
  );

  return {
    items,
    total,
    isLoading: false,
    approveLeaveRequest,
    declineLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
  };
}
