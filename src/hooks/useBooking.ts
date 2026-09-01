"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import type { Therapist } from "@/types";

export function useBooking() {
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<Therapist | null>(null);

  const book = useCallback(
    (t: Therapist) => {
      if (!user) {
        router.push(
          `/access?callbackUrl=${encodeURIComponent(
            `/patient/sessions?book=${encodeURIComponent(t.id)}`,
          )}`,
        );
        return;
      }
      setBooking(t);
    },
    [user, router],
  );

  return { booking, book, closeBooking: () => setBooking(null) };
}
