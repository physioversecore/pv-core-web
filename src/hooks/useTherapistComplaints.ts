"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitTherapistComplaint,
  getTherapistComplaints,
  type AdminComplaintData,
  type TherapistComplaintPayload,
} from "@/services/api/admin";

const SEED_THERAPIST_COMPLAINTS: AdminComplaintData[] = [
  {
    id: "CMT-018", type: "therapist", complainant: "Sujan Karki", complainantId: "t3",
    against: "Hari Bahadur Rai", againstId: "p3", category: "Repeated no-shows",
    priority: "Normal", status: "Under review", filed: "2026-07-12T07:00:00",
    description: "Patient has missed 3 consecutive sessions without prior notice. Wasting therapist travel time.",
    bookingId: "BKG-1035",
    notes: ["Patient notified via SMS"],
  },
  {
    id: "CMT-014", type: "therapist", complainant: "Anita Tamang", complainantId: "t2",
    against: "Sita Gurung", againstId: "p4", category: "Safety concern at home",
    priority: "Urgent", status: "Open", filed: "2026-07-09T11:30:00",
    description: "Unsafe conditions observed at patient's home — loose flooring, no handrails. Risk of falls during session.",
    bookingId: "BKG-1010",
  },
];

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

const QUERY_KEY = "therapist-complaints";

export function useTherapistComplaints(therapistId: string) {
  const queryClient = useQueryClient();
  const lastSubmitRef = useRef<{ bookingId: string; category: string; at: number } | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEY, therapistId],
    queryFn: () => getTherapistComplaints(therapistId),
    enabled: !!therapistId,
  });

  const seedFiltered = SEED_THERAPIST_COMPLAINTS.filter(
    (c) => c.complainantId === therapistId
  );
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const submitMutation = useMutation({
    mutationFn: (data: TherapistComplaintPayload) => submitTherapistComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, therapistId] });
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
    submitComplaint,
    isSubmitting: submitMutation.isPending,
  };
}
