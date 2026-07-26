"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminUsers,
  inviteAdminUser,
  updateAdminUserRole,
  deactivateAdminUser,
  reactivateAdminUser,
  type AdminUserData,
  type AdminRoleName,
} from "@/services/api/admin";

const SEED: AdminUserData[] = [
  {
    id: "adm-001",
    name: "Admin User",
    email: "admin@sahayatriphysio.com",
    role: "Super Admin",
    isActive: true,
    permissions: ["manage_bookings", "manage_complaints", "manage_payments", "manage_admins"],
    permissionSummary: "Full access — bookings, payments, complaints, and admin management.",
  },
  {
    id: "adm-002",
    name: "Roshani Sharma",
    email: "roshani@sahayatriphysio.com",
    role: "Support Admin",
    isActive: true,
    permissions: ["manage_complaints", "manage_notifications"],
    permissionSummary: "Handles complaints and notifications. No payment or admin-team access.",
  },
  {
    id: "adm-003",
    name: "Bikash Karki",
    email: "bikash@sahayatriphysio.com",
    role: "Finance Admin",
    isActive: true,
    permissions: ["manage_payments"],
    permissionSummary: "Manages payments and payouts only.",
  },
];

const QUERY_KEY = "admin-team";

export function useAdminTeam() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => getAdminUsers(),
    placeholderData: (prev) => prev,
  });

  const items = query.data?.items ?? SEED;

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; name: string; role: AdminRoleName }) => inviteAdminUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: AdminRoleName }) => updateAdminUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateAdminUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    items,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    inviteAdmin: useCallback(
      (data: { email: string; name: string; role: AdminRoleName }) => inviteMutation.mutateAsync(data),
      [inviteMutation],
    ),
    updateRole: useCallback(
      (id: string, role: AdminRoleName) => updateRoleMutation.mutateAsync({ id, role }),
      [updateRoleMutation],
    ),
    deactivate: useCallback(
      (id: string) => deactivateMutation.mutateAsync(id),
      [deactivateMutation],
    ),
    reactivate: useCallback(
      (id: string) => reactivateMutation.mutateAsync(id),
      [reactivateMutation],
    ),
  };
}
