"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBookings,
  type AdminBookingData,
} from "@/services/api/admin";
import type { SortDirection } from "@/hooks/useTableSort";

const SEED: AdminBookingData[] = [
  {
    id: "BKG-1042",
    patient: "Nabin Khadka",
    patientId: "p1",
    patientPhone: "+977-9841-123456",
    patientEmail: "nabin@email.com",
    therapist: "Rajesh Shrestha",
    therapistId: "t1",
    therapistPhone: "+977-9851-654321",
    therapistEmail: "rajesh@sahayatriphysio.com",
    date: "2026-07-12",
    originalTime: "2:00 PM",
    sessionType: "Sports rehab session",
    status: "Rescheduled",
    paymentStatus: "Paid",
    sessionNotes: "Post-ACL reconstruction rehab, week 6.",
    trail: [
      {
        id: "evt-1",
        type: "cancelled",
        timestamp: "2026-07-12T11:30:00",
        description: "2:00 PM slot cancelled by patient — reason: \"emergency at work\". Slot auto-released on Rajesh Shrestha's calendar.",
        dotColor: "danger",
      },
      {
        id: "evt-2",
        type: "rebooked",
        timestamp: "2026-07-12T12:15:00",
        description: "Rebooked for tomorrow, 10:00 AM — Rajesh Shrestha's availability confirmed, both parties notified.",
        dotColor: "secondary",
      },
    ],
  },
  {
    id: "BKG-1041",
    patient: "Sita Gurung",
    patientId: "p2",
    patientPhone: "+977-9841-234567",
    patientEmail: "sita@email.com",
    therapist: "Anita Tamang",
    therapistId: "t2",
    therapistPhone: "+977-9851-765432",
    therapistEmail: "anita@sahayatriphysio.com",
    date: "2026-07-12",
    originalTime: "2:00 PM",
    sessionType: "Neuro rehab session",
    status: "Cancelled",
    paymentStatus: "Pending",
    trail: [
      {
        id: "evt-3",
        type: "cancelled",
        timestamp: "2026-07-12T13:42:00",
        description: "2:00 PM slot cancelled by patient — reason: \"family emergency\". No reschedule requested yet.",
        dotColor: "danger",
      },
    ],
  },
  {
    id: "BKG-1040",
    patient: "Hari Bahadur Rai",
    patientId: "p3",
    patientPhone: "+977-9841-345678",
    patientEmail: "hari@email.com",
    therapist: "Sujan Karki",
    therapistId: "t3",
    therapistPhone: "+977-9851-876543",
    therapistEmail: "sujan@sahayatriphysio.com",
    date: "2026-07-13",
    originalTime: "4:00 PM",
    sessionType: "General musculoskeletal",
    status: "Confirmed",
    paymentStatus: "Paid",
    sessionNotes: "Follow-up for lower back pain. Continue with current exercise regimen.",
    trail: [
      {
        id: "evt-4",
        type: "confirmed",
        timestamp: "2026-07-11T09:00:00",
        description: "No changes — session confirmed and on schedule.",
        dotColor: "secondary",
      },
    ],
  },
];

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
  const queryClient = useQueryClient();
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

  const seedFiltered = useSeedFilter(SEED, { search, status, dateFrom, dateTo, sortBy, sortOrder });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  return {
    items,
    total,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}

function useSeedFilter(
  seed: AdminBookingData[],
  params: { search: string; status: string; dateFrom: string; dateTo: string; sortBy: string; sortOrder: SortDirection },
): AdminBookingData[] {
  let result = [...seed];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.patient.toLowerCase().includes(q) ||
        r.therapist.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }
  if (params.status) {
    result = result.filter((r) => r.status === params.status);
  }
  if (params.dateFrom) {
    result = result.filter((r) => r.date >= params.dateFrom);
  }
  if (params.dateTo) {
    result = result.filter((r) => r.date <= params.dateTo);
  }
  if (params.sortBy) {
    result.sort((a, b) => {
      const aVal = a[params.sortBy as keyof AdminBookingData] ?? "";
      const bVal = b[params.sortBy as keyof AdminBookingData] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return params.sortOrder === "desc" ? -cmp : cmp;
    });
  }

  return result;
}
