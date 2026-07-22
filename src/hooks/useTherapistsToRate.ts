"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTherapistsToRate, submitReview } from "@/services/api/reviews";
import { toast } from "sonner";

export function useTherapistsToRate(limit?: number) {
  const query = useQuery({
    queryKey: ["therapists-to-rate", limit],
    queryFn: () => getTherapistsToRate(limit),
  });

  return {
    therapistsToRate: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sessionId: string; rating: number; comment?: string }) =>
      submitReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapists-to-rate"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Review submitted. Thank you!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit review");
    },
  });
}
