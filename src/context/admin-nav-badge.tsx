"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminNavBadges } from "@/services/api/admin";
import { useAuth } from "@/context/auth";

interface AdminNavBadgeCtx {
  pendingLeaves: number;
  pendingRefunds: number;
  pendingVerifications: number;
}

const Ctx = createContext<AdminNavBadgeCtx>({
  pendingLeaves: 0,
  pendingRefunds: 0,
  pendingVerifications: 0,
});

export function AdminNavBadgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" as const;

  const { data } = useQuery({
    queryKey: ["admin-nav-badges"],
    queryFn: getAdminNavBadges,
    enabled: isAdmin,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });

  return (
    <Ctx.Provider
      value={{
        pendingLeaves: data?.pendingLeaves ?? 0,
        pendingRefunds: data?.pendingRefunds ?? 0,
        pendingVerifications: data?.pendingVerifications ?? 0,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdminNavBadge() {
  return useContext(Ctx);
}
