"use client";

import { useQuery } from "@tanstack/react-query";
import { getActivePackage } from "@/services/api/packages";
import { useAuth } from "@/context/auth";
import type { PackagePurchaseDetail } from "@/types";

export function useActivePackage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["active-package", user?.id],
    queryFn: () => getActivePackage(),
    enabled: !!user && user.role === "patient",
  });
  return { activePackage: (data ?? null) as PackagePurchaseDetail | null, isLoading };
}
