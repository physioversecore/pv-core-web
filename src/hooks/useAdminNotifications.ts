"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AdminNotificationData,
} from "@/services/api/admin";

const SEED: AdminNotificationData[] = [
  {
    id: "n1", category: "reschedule", read: false, timestamp: "2026-07-12T10:20:00",
    message: "Rajesh Shrestha's 2:00 PM session with Sita Gurung was rescheduled to tomorrow, 10:00 AM — patient requested",
    actionLabel: "View schedule →", actionHref: "/admin/bookings",
    relatedEntityType: "booking", relatedEntityId: "BKG-1040",
  },
  {
    id: "n2", category: "complaint", read: false, timestamp: "2026-07-12T10:28:00",
    message: "New complaint CMP-041 filed by Nabin Khadka against Rajesh Shrestha",
    actionLabel: "Review complaint →", actionHref: "/admin/complaints",
    relatedEntityType: "complaint", relatedEntityId: "CMP-041",
  },
  {
    id: "n3", category: "booking", read: false, timestamp: "2026-07-12T10:12:00",
    message: "Sita Gurung cancelled her session with Anita Tamang — reason: family emergency",
    actionLabel: "View booking →", actionHref: "/admin/bookings",
    relatedEntityType: "booking", relatedEntityId: "BKG-1038",
  },
  {
    id: "n4", category: "payment", read: true, timestamp: "2026-07-12T09:30:00",
    message: "Payout of Rs 6,000 processed to Rajesh Shrestha",
    actionLabel: "View booking →", actionHref: "/admin/payments",
    relatedEntityType: "payment", relatedEntityId: "PAY-2088",
  },
  {
    id: "n5", category: "complaint", read: true, timestamp: "2026-07-12T07:00:00",
    message: "Complaint CMT-018 — Sujan Karki flagged patient Hari Bahadur Rai",
    actionLabel: "Open queue →", actionHref: "/admin/complaints",
    relatedEntityType: "complaint", relatedEntityId: "CMT-018",
  },
  {
    id: "n6", category: "system", read: true, timestamp: "2026-07-11T18:00:00",
    message: "Weekly payout run completed for 12 therapists",
    actionLabel: "Open queue →", actionHref: "/admin/payments",
  },
  {
    id: "n7", category: "reschedule", read: true, timestamp: "2026-07-11T12:00:00",
    message: "Puja Maharjan rescheduled from Jul 11 to Jul 13 with Sujan Karki",
    actionLabel: "View schedule →", actionHref: "/admin/bookings",
    relatedEntityType: "booking", relatedEntityId: "BKG-1018",
  },
];

const QUERY_KEY = "admin-notifications";

interface UseAdminNotificationsParams {
  category: string;
  page: number;
  pageSize: number;
}

export function useAdminNotifications(params: UseAdminNotificationsParams) {
  const queryClient = useQueryClient();
  const { category, page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const query = useQuery({
    queryKey: [QUERY_KEY, { category, skip, pageSize }],
    queryFn: () =>
      getAdminNotifications({
        category: category || undefined,
        skip,
        limit: pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const seedFiltered = useSeedFilter(SEED, { category });
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;
  const unreadCount = (query.data?.items ?? seedFiltered).filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    total,
    unreadCount,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    markRead: useCallback((id: string) => markReadMutation.mutateAsync(id), [markReadMutation]),
    markAllRead: useCallback(() => markAllReadMutation.mutateAsync(), [markAllReadMutation]),
  };
}

function useSeedFilter(
  seed: AdminNotificationData[],
  params: { category: string },
): AdminNotificationData[] {
  if (!params.category) return seed;
  return seed.filter((n) => n.category === params.category);
}
