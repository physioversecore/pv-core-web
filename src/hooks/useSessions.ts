"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessions, getSession, updateSession, rescheduleSession } from "@/services/api/sessions";
import { toast } from "sonner";
import type { SessionData } from "@/services/api/sessions";

interface UseSessionsOptions {
  skip?: number;
  limit?: number;
}

export function useSessions(options?: UseSessionsOptions) {
  const queryClient = useQueryClient();

  const { data: sessionsData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["sessions", options?.skip, options?.limit],
    queryFn: () => getSessions({ skip: options?.skip, limit: options?.limit }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      updateSession(id, { status: "CANCELLED", notes: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["patient-dashboard"] });
      toast.success("Session cancelled");
    },
    onError: () => toast.error("Failed to cancel session"),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: string; newDate: string; newTime: string }) =>
      rescheduleSession(id, { newDate, newTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-slots"] });
      toast.success("Session rescheduled");
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("409") || err.message?.includes("conflict")
        ? "That slot was just booked — please choose another."
        : "Failed to reschedule session";
      toast.error(msg);
    },
  });

  return {
    sessions: sessionsData?.sessions ?? [],
    total: sessionsData?.total ?? 0,
    isLoading,
    isRefetching,
    refetch,
    cancelSession: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    rescheduleSession: rescheduleMutation.mutate,
    isRescheduling: rescheduleMutation.isPending,
  };
}

export function useSessionDetail(id: string | null) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => (id ? getSession(id) : null),
    enabled: !!id,
  });
}
