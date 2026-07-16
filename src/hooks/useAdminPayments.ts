"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPayments,
  updateAdminPayment,
  deleteAdminPayment,
  type AdminPaymentData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const INITIAL_SEED: AdminPaymentData[] = [
  { id: "BK-1041", patient: "Sita Gurung", patientId: "u1", therapist: "Rajesh Shrestha", therapistId: "t1", amount: 1200, method: "eSewa", status: "Paid", date: "2026-07-10" },
  { id: "BK-1040", patient: "Hari Bahadur Rai", patientId: "u2", therapist: "Rajesh Shrestha", therapistId: "t1", amount: 1200, method: "Khalti", status: "Paid", date: "2026-07-09" },
  { id: "BK-1039", patient: "Nabin Khadka", patientId: "u3", therapist: "Anita Tamang", therapistId: "t2", amount: 1500, method: "Cash", status: "Pending", date: "2026-07-08" },
  { id: "BK-1038", patient: "Puja Maharjan", patientId: "u4", therapist: "Sujan Karki", therapistId: "t3", amount: 1000, method: "eSewa", status: "Paid", date: "2026-07-07" },
];

const QUERY_KEY = "admin-payments";

interface UseAdminPaymentsParams {
  search: string;
  dateFrom: string;
  dateTo: string;
  patientId: string;
  therapistId: string;
  status: string;
  method: string;
  sortBy: string;
  sortOrder: SortDirection;
  page: number;
  pageSize: number;
}

export function useAdminPayments(params: UseAdminPaymentsParams) {
  const queryClient = useQueryClient();
  const { search, dateFrom, dateTo, patientId, therapistId, status, method, sortBy, sortOrder, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const [seed, setSeed] = useState(INITIAL_SEED);

  const query = useQuery({
    queryKey: [QUERY_KEY, { search, dateFrom, dateTo, patientId, therapistId, status, method, sortBy, sortOrder, skip, pageSize }],
    queryFn: () =>
      getAdminPayments({
        search: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        patientId: patientId || undefined,
        therapistId: therapistId || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const usingApiData = !!query.data;
  const seedFiltered = useSeedFilter(seed, { search, dateFrom, dateTo, patientId, therapistId, status, method, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPayment,
    onSuccess: (_result, id) => {
      if (!usingApiData) {
        setSeed((prev) => prev.filter((item) => item.id !== id));
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (_err, id) => {
      if (!usingApiData) {
        setSeed((prev) => prev.filter((item) => item.id !== id));
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminPaymentData> }) =>
      updateAdminPayment(id, data),
    onSuccess: (_result, { id, data }) => {
      if (!usingApiData) {
        setSeed((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (_err, { id, data }) => {
      if (!usingApiData) {
        setSeed((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      }
    },
  });

  return {
    items,
    total,
    isLoading: query.isLoading,
    deletePayment: useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]),
    updatePayment: useCallback(
      (id: string, data: Partial<AdminPaymentData>) => updateMutation.mutateAsync({ id, data }),
      [updateMutation],
    ),
    patients: [
      { id: "u1", name: "Sita Gurung" },
      { id: "u2", name: "Hari Bahadur Rai" },
      { id: "u3", name: "Nabin Khadka" },
      { id: "u4", name: "Puja Maharjan" },
    ],
    therapists: [
      { id: "t1", name: "Rajesh Shrestha" },
      { id: "t2", name: "Anita Tamang" },
      { id: "t3", name: "Sujan Karki" },
    ],
  };
}

function useSeedFilter(
  seed: AdminPaymentData[],
  params: { search: string; dateFrom: string; dateTo: string; patientId: string; therapistId: string; status: string; method: string; sortBy: string; sortOrder: SortDirection },
): AdminPaymentData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter((r) => r.patient.toLowerCase().includes(q));
  }
  if (params.patientId) {
    result = result.filter((r) => r.patientId === params.patientId);
  }
  if (params.therapistId) {
    result = result.filter((r) => r.therapistId === params.therapistId);
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.method) {
    result = result.filter((r) => r.method === params.method);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.date >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.date <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminPaymentData] ?? "";
      const bVal = b[params.sortBy as keyof AdminPaymentData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
