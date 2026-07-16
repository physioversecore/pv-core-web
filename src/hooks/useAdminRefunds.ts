"use client";

import { useState, useMemo, useCallback } from "react";

type RefundStatus = "Pending" | "Approved" | "Denied";
type RefundReason = "No-show" | "Double charge" | "Service quality" | "Cancellation";

export interface RefundItem {
  id: string;
  patient: string;
  patientId: string;
  bookingId: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
  filed: string;
  resolvedAt?: string;
  denyReason?: string;
}

const MOCK_REFUNDS: RefundItem[] = [
  {
    id: "REF-1001",
    patient: "Sita Sharma",
    patientId: "PAT-201",
    bookingId: "BK-4501",
    amount: 2500,
    reason: "No-show",
    status: "Pending",
    filed: "2026-07-10",
  },
  {
    id: "REF-1002",
    patient: "Ram Thapa",
    patientId: "PAT-108",
    bookingId: "BK-4480",
    amount: 1500,
    reason: "Double charge",
    status: "Pending",
    filed: "2026-07-12",
  },
  {
    id: "REF-1003",
    patient: "Gita Gurung",
    patientId: "PAT-305",
    bookingId: "BK-4390",
    amount: 3200,
    reason: "Service quality",
    status: "Approved",
    filed: "2026-06-28",
    resolvedAt: "2026-06-30",
  },
  {
    id: "REF-1004",
    patient: "Hari Bahadur",
    patientId: "PAT-176",
    bookingId: "BK-4215",
    amount: 1000,
    reason: "Cancellation",
    status: "Denied",
    filed: "2026-06-20",
    resolvedAt: "2026-06-22",
    denyReason: "Cancellation was within 24-hour window, no refund policy applies.",
  },
  {
    id: "REF-1005",
    patient: "Anita Magar",
    patientId: "PAT-290",
    bookingId: "BK-4520",
    amount: 4500,
    reason: "Double charge",
    status: "Approved",
    filed: "2026-07-01",
    resolvedAt: "2026-07-03",
  },
  {
    id: "REF-1006",
    patient: "Binod Karki",
    patientId: "PAT-142",
    bookingId: "BK-4305",
    amount: 2000,
    reason: "No-show",
    status: "Approved",
    filed: "2026-06-25",
    resolvedAt: "2026-06-27",
  },
  {
    id: "REF-1007",
    patient: "Sunita Rai",
    patientId: "PAT-388",
    bookingId: "BK-4555",
    amount: 1800,
    reason: "Service quality",
    status: "Pending",
    filed: "2026-07-14",
  },
  {
    id: "REF-1008",
    patient: "Deepak Shrestha",
    patientId: "PAT-220",
    bookingId: "BK-4190",
    amount: 5000,
    reason: "Cancellation",
    status: "Approved",
    filed: "2026-06-15",
    resolvedAt: "2026-06-18",
  },
];

const today = () => new Date().toISOString().split("T")[0];

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
  const [refunds, setRefunds] = useState<RefundItem[]>(MOCK_REFUNDS);

  const { filtered, total } = useMemo(() => {
    let result = [...refunds];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.patient.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.bookingId.toLowerCase().includes(q),
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

    const col = params.sortBy as keyof RefundItem;
    result.sort((a, b) => {
      const av = a[col] ?? "";
      const bv = b[col] ?? "";
      if (av < bv) return params.sortOrder === "asc" ? -1 : 1;
      if (av > bv) return params.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const start = (params.page - 1) * params.pageSize;
    result = result.slice(start, start + params.pageSize);

    return { filtered: result, total };
  }, [refunds, params]);

  const approveRefund = useCallback(async (id: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" as const, resolvedAt: today() } : r,
      ),
    );
  }, []);

  const denyRefund = useCallback(async (id: string, reason: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setRefunds((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "Denied" as const, resolvedAt: today(), denyReason: reason }
          : r,
      ),
    );
  }, []);

  const updateRefund = useCallback(
    async (id: string, data: { amount?: number; reason?: RefundReason; status?: RefundStatus }) => {
      await new Promise((r) => setTimeout(r, 400));
      setRefunds((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r)),
      );
    },
    [],
  );

  const deleteRefund = useCallback(async (id: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setRefunds((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    items: filtered,
    total,
    isLoading: false,
    approveRefund,
    denyRefund,
    updateRefund,
    deleteRefund,
  };
}
