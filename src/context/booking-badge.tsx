"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNewBookingCount } from "@/services/api/admin";
import { useAuth } from "@/context/auth";

interface BookingBadgeCtx {
  bookingCount: number;
  resetBookingCount: () => void;
}

const Ctx = createContext<BookingBadgeCtx>({ bookingCount: 0, resetBookingCount: () => {} });

const STORAGE_KEY = "admin_last_booking_visit";

function getLastVisit(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setLastVisit(ts: string) {
  localStorage.setItem(STORAGE_KEY, ts);
}

export function BookingBadgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [since, setSince] = useState<string | null>(getLastVisit);
  const sinceRef = useRef(since);

  const isAdmin = user?.role === "admin" as const;

  const { data } = useQuery({
    queryKey: ["admin-new-bookings", since],
    queryFn: () => getNewBookingCount(since ?? undefined),
    enabled: isAdmin,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });

  const bookingCount = data?.count ?? 0;

  const resetBookingCount = useCallback(() => {
    const now = new Date().toISOString();
    setLastVisit(now);
    sinceRef.current = now;
    setSince(now);
    queryClient.setQueryData(["admin-new-bookings", now], { count: 0 });
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
    <Ctx.Provider value={{ bookingCount, resetBookingCount }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingBadge() {
  return useContext(Ctx);
}
