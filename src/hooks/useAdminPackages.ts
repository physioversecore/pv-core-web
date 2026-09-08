"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPackages,
  createAdminPackage,
  updateAdminPackage,
  deleteAdminPackage,
  getAdminPackagePurchases,
  getAdminPackageStats,
  type CreatePackagePayload,
} from "@/services/api/admin";
import type { AdminPackagePurchase, AdminPackageStats, Package } from "@/types";

export function useAdminPackages() {
  const queryClient = useQueryClient();

  const packagesQuery = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => getAdminPackages(),
  });

  const purchasesQuery = useQuery({
    queryKey: ["admin-package-purchases"],
    queryFn: () => getAdminPackagePurchases({ skip: 0, limit: 200 }),
  });

  const statsQuery = useQuery({
    queryKey: ["admin-package-stats"],
    queryFn: () => getAdminPackageStats(),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-package-purchases"] });
    queryClient.invalidateQueries({ queryKey: ["admin-package-stats"] });
    queryClient.invalidateQueries({ queryKey: ["packages"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreatePackagePayload) => createAdminPackage(data),
    onSuccess: refreshAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePackagePayload> }) =>
      updateAdminPackage(id, data),
    onSuccess: refreshAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminPackage(id),
    onSuccess: refreshAll,
  });

  return {
    packages: (packagesQuery.data?.packages ?? []) as Package[],
    purchases: (purchasesQuery.data?.purchases ?? []) as AdminPackagePurchase[],
    stats: (statsQuery.data ?? null) as AdminPackageStats | null,
    isLoading: packagesQuery.isLoading || purchasesQuery.isLoading || statsQuery.isLoading,
    isRefetching:
      packagesQuery.isRefetching || purchasesQuery.isRefetching || statsQuery.isRefetching,
    refetch: () => {
      packagesQuery.refetch();
      purchasesQuery.refetch();
      statsQuery.refetch();
    },
    createPackage: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePackage: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePackage: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
