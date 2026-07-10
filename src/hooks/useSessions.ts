"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessions, getSession, updateSession, createSession } from "@/services/api/sessions";
import { toast } from "sonner";
import type { SessionData } from "@/services/api/sessions";

interface UseSessionsOptions {
  skip?: number;
  limit?: number;
}

export function useSessions(options?: UseSessionsOptions) {
  const queryClient = useQueryClient();

  const { data: sessionsData, isLoading } = useQuery({
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
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      updateSession(id, { date, time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session rescheduled");
    },
    onError: () => toast.error("Failed to reschedule session"),
  });

  return {
    sessions: sessionsData?.sessions ?? [],
    total: sessionsData?.total ?? 0,
    isLoading,
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
