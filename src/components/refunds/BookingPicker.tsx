"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Check, Loader2 } from "lucide-react";
import { getAdminBookings } from "@/services/api/admin";

interface BookingPickerProps {
  patientId: string;
  value: string;
  onChange: (id: string) => void;
}

export function BookingPicker({ patientId, value, onChange }: BookingPickerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["refund-booking-search", patientId],
    queryFn: () => getAdminBookings({ patientId, limit: 10, sortBy: "date", sortOrder: "desc" }),
    enabled: !!patientId,
    placeholderData: (prev) => prev,
  });

  const bookings = data?.items ?? [];

  if (!patientId) {
    return (
      <p className="text-xs text-text-light border border-dashed border-border rounded-lg px-3 py-2">
        Select a patient first to load their bookings.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-light py-1">
        <Loader2 size={12} className="animate-spin" />
        Loading bookings…
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <p className="text-xs text-text-light border border-dashed border-border rounded-lg px-3 py-2">
        No bookings found for this patient.
      </p>
    );
  }

  return (
    <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
      {bookings.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(b.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left cursor-pointer transition ${
            b.id === value ? "bg-secondary/10" : "hover:bg-surface"
          }`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Calendar size={14} className="shrink-0 text-text-light" />
            <span className="min-w-0">
              <span className="block font-mono text-xs truncate">{b.id}</span>
              <span className="block text-xs text-text-light truncate">
                {b.date} · {b.originalTime} · {b.therapist}
              </span>
            </span>
          </span>
          {b.id === value && <Check size={14} className="shrink-0 text-secondary" />}
        </button>
      ))}
    </div>
  );
}
