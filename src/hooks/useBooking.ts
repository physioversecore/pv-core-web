"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth";
import { useAuthModal } from "@/context/auth-modal";
import type { Therapist } from "@/types";

export function useBooking() {
  const { user } = useAuth();
  const { openAuth, setOnLoginSuccess } = useAuthModal();
  const [booking, setBooking] = useState<Therapist | null>(null);
  const pendingRef = useRef<Therapist | null>(null);

  const book = useCallback(
    (t: Therapist) => {
      if (!user) {
        pendingRef.current = t;
        setOnLoginSuccess(() => {
          setBooking(t);
          pendingRef.current = null;
        });
        return openAuth("signup");
      }
      setBooking(t);
    },
    [user, openAuth, setOnLoginSuccess],
  );

  useEffect(() => {
    return () => setOnLoginSuccess(null);
  }, [setOnLoginSuccess]);

  return { booking, book, closeBooking: () => setBooking(null) };
}
