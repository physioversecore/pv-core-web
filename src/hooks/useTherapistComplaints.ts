"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitTherapistComplaint,
  getTherapistComplaints,
  type AdminComplaintData,
  type TherapistComplaintPayload,
} from "@/services/api/admin";

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

const QUERY_KEY = "therapist-complaints";

export function useTherapistComplaints(therapistId: string) {
  const queryClient = useQueryClient();
  const lastSubmitRef = useRef<{ bookingId: string; category: string; at: number } | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEY, therapistId],
    queryFn: () => getTherapistComplaints(therapistId),
    enabled: false,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const submitMutation = useMutation({
    mutationFn: (data: TherapistComplaintPayload) => submitTherapistComplaint(data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEY, therapistId] });
      toast.success("Complaint submitted successfully");
    },
  });

  const submitComplaint = useCallback(
    async (data: TherapistComplaintPayload) => {
      const now = Date.now();
      const last = lastSubmitRef.current;
      if (
        last &&
        last.bookingId === (data.bookingId ?? "") &&
        last.category === data.category &&
        now - last.at < DUPLICATE_WINDOW_MS
      ) {
        toast.error("Duplicate complaint. Please wait a few minutes before submitting the same issue again.");
        return false;
      }

      try {
        await submitMutation.mutateAsync(data);
        lastSubmitRef.current = {
          bookingId: data.bookingId ?? "",
          category: data.category,
          at: now,
        };
        return true;
      } catch {
        toast.error("Failed to submit complaint. Please try again.");
        return false;
      }
    },
    [submitMutation]
  );

  return {
    items,
    total,
    isLoading: query.isLoading,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    submitComplaint,
    isSubmitting: submitMutation.isPending,
  };
}
