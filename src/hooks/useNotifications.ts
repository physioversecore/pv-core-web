"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/api/notifications";

const QUERY_KEY = "notifications";

/**
 * The signed-in user's own feed — patients and therapists alike. The admin
 * dashboard has its own separate `useAdminNotifications`.
 */
export function useNotifications(limit = 30) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY, limit],
    queryFn: () => getNotifications({ limit }),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  });

  return {
    notifications: query.data?.notifications ?? [],
    total: query.data?.total ?? 0,
    unread: query.data?.unread ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
    markRead: readMutation.mutateAsync,
    markAllRead: readAllMutation.mutateAsync,
    isMarkingAll: readAllMutation.isPending,
  };
}
