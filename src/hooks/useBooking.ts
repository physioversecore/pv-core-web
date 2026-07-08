"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/auth";
import { useAuthModal } from "@/context/auth-modal";
import type { Therapist } from "@/types";

export function useBooking() {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const [booking, setBooking] = useState<Therapist | null>(null);

  const book = useCallback(
    (t: Therapist) => {
      if (!user) return openAuth("signup");
      setBooking(t);
    },
    [user, openAuth],
  );

  return { booking, book, closeBooking: () => setBooking(null) };
}
