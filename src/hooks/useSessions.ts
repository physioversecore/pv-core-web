"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSessions, updateSession } from "@/services/api/sessions";
import { toast } from "sonner";

export function useSessions() {
  const queryClient = useQueryClient();

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => getSessions(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateSession(id, { status: "CANCELLED" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session cancelled");
    },
    onError: () => toast.error("Failed to cancel session"),
  });

  return {
    sessions: sessionsData?.sessions ?? [],
    total: sessionsData?.total ?? 0,
    cancelSession: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
}
