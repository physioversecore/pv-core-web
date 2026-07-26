"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitPatientComplaint,
  getPatientComplaints,
  type AdminComplaintData,
  type PatientComplaintPayload,
} from "@/services/api/admin";

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

const QUERY_KEY = "patient-complaints";

export function usePatientComplaints(patientId: string) {
  const queryClient = useQueryClient();
  const lastSubmitRef = useRef<{ bookingId: string; category: string; at: number } | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEY, patientId],
    queryFn: () => getPatientComplaints(patientId),
    enabled: !!patientId,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const submitMutation = useMutation({
    mutationFn: (data: PatientComplaintPayload) => submitPatientComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, patientId] });
      toast.success("Complaint submitted successfully");
    },
  });

  const submitComplaint = useCallback(
    async (data: PatientComplaintPayload) => {
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
