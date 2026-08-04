"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNewComplaintCount } from "@/services/api/admin";
import { useAuth } from "@/context/auth";

interface ComplaintBadgeCtx {
  complaintCount: number;
  resetComplaintCount: () => void;
}

const Ctx = createContext<ComplaintBadgeCtx>({ complaintCount: 0, resetComplaintCount: () => {} });

const STORAGE_KEY = "admin_last_complaint_visit";

function getLastVisit(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setLastVisit(ts: string) {
  localStorage.setItem(STORAGE_KEY, ts);
}

export function ComplaintBadgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [since, setSince] = useState<string | null>(getLastVisit);
  const sinceRef = useRef(since);

  const isAdmin = user?.role === "admin" as const;

  const { data } = useQuery({
    queryKey: ["admin-new-complaints", since],
    queryFn: () => getNewComplaintCount(since ?? undefined),
    enabled: isAdmin,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });

  const complaintCount = data?.count ?? 0;

  const resetComplaintCount = useCallback(() => {
    const now = new Date().toISOString();
    setLastVisit(now);
    sinceRef.current = now;
    setSince(now);
    queryClient.setQueryData(["admin-new-complaints", now], { count: 0 });
  }, [queryClient]);

  useEffect(() => {
    if (isAdmin && sinceRef.current === null) {
      const now = new Date().toISOString();
      setLastVisit(now);
      sinceRef.current = now;
      setSince(now);
    }
  }, [isAdmin]);

  return (
    <Ctx.Provider value={{ complaintCount, resetComplaintCount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useComplaintBadge() {
  return useContext(Ctx);
}
