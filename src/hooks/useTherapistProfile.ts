"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTherapistProfile,
  updateTherapistFullProfile,
} from "@/services/api/profile";
import type { TherapistProfileData } from "@/services/api/profile";

export function useTherapistProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["therapist-profile"],
    queryFn: () => getTherapistProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TherapistProfileData>) =>
      updateTherapistFullProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-profile"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-dashboard"] });
    },
  });

  return {
    profile: data ?? null,
    isLoading,
    error,
    refetch,
    isRefetching,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
