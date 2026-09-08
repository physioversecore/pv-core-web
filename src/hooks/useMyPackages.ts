"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPackages } from "@/services/api/packages";
import { useAuth } from "@/context/auth";
import type { PackagePurchase } from "@/types";

export function useMyPackages() {
  const { user } = useAuth();
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ["my-packages", user?.id],
    queryFn: () => getMyPackages(),
    enabled: !!user && user.role === "patient",
  });
  return {
    purchases: (data?.purchases ?? []) as PackagePurchase[],
    total: data?.total ?? 0,
    isLoading,
    isRefetching,
    refetch,
    error,
  };
}
