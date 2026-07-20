"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BookingModal } from "@/components/BookingModal";
import { getTherapist } from "@/services/api/therapists";

export default function BookPage({ params }: { params: Promise<{ therapistId: string }> }) {
  const { therapistId } = use(params);
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const { data: therapist, isLoading } = useQuery({
    queryKey: ["therapist", therapistId],
    queryFn: () => getTherapist(therapistId),
    enabled: !!therapistId,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-[#1F3D2B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <p className="text-[#1E2A2E] font-semibold mb-4">Therapist not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1F3D2B] text-white rounded-xl text-sm font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    router.back();
    return null;
  }

  return <BookingModal therapist={therapist} onClose={() => setOpen(false)} />;
}
