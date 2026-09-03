"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AdminNotificationData,
} from "@/services/api/admin";

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

  const items: AdminNotificationData[] = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const unreadCount = query.data?.unreadCount ?? 0;

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
