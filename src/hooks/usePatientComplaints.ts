"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  submitPatientComplaint,
  getPatientComplaints,
  type AdminComplaintData,
  type PatientComplaintPayload,
} from "@/services/api/admin";

const SEED_PATIENT_COMPLAINTS: AdminComplaintData[] = [
  {
    id: "CMP-041", type: "patient", complainant: "Nabin Khadka", complainantId: "p1",
    against: "Rajesh Shrestha", againstId: "t1", category: "Late arrival",
    priority: "Normal", status: "Open", filed: "2026-07-12T10:30:00",
    description: "Therapist arrived 40 minutes late to the scheduled home visit session. No prior notice was given.",
    bookingId: "BKG-1042",
  },
  {
    id: "CMP-039", type: "patient", complainant: "Puja Maharjan", complainantId: "p2",
    against: "Sujan Karki", againstId: "t3", category: "Unprofessional conduct",
    priority: "Urgent", status: "Under review", filed: "2026-07-10T14:15:00",
    description: "Therapist made inappropriate comments during the session. Felt uncomfortable and unsafe.",
    bookingId: "BKG-1018",
    notes: ["Assigned to senior admin", "Awaiting therapist response"],
  },
  {
    id: "CMP-035", type: "patient", complainant: "Hari Bahadur Rai", complainantId: "p3",
    against: "Anita Tamang", againstId: "t2", category: "Billing dispute",
    priority: "Normal", status: "Resolved", filed: "2026-07-06T09:00:00",
    description: "Charged Rs 2,500 instead of the agreed Rs 2,000 for the session. Requesting refund of difference.",
    bookingId: "BKG-0995",
    notes: ["Refund of Rs 500 processed", "Patient confirmed resolution"],
  },
];

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

  const seedFiltered = SEED_PATIENT_COMPLAINTS.filter(
    (c) => c.complainantId === patientId
  );
  const items = query.data?.items ?? seedFiltered;
  const total = query.data?.total ?? seedFiltered.length;

  const submitMutation = useMutation({
    mutationFn: (data: PatientComplaintPayload) => submitPatientComplaint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, patientId] });
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
