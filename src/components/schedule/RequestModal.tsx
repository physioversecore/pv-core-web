"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { to12h } from "@/lib/format";
import type { ScheduleAppointment } from "@/hooks/useTherapistSchedule";

interface RequestModalProps {
  appointment: ScheduleAppointment;
  mode: "reschedule_requested" | "decline_requested";
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function RequestModal({
  appointment: a,
  mode,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RequestModalProps) {
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isReschedule = mode === "reschedule_requested";

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35">
      <div className="bg-white rounded-2xl shadow-lg w-[380px] max-w-[90vw] p-6">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-display text-base font-semibold">
            {isReschedule ? "Request reschedule" : "Request decline"}
          </h4>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-light mb-4">
          For {a.patient} · {to12h(a.time)} on{" "}
          {new Date(a.date + "T00:00:00").toDateString()}
          <br />
          This goes to admin for approval — the patient stays booked until
          admin decides.
        </p>
        <textarea
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            isReschedule
              ? "Reason + a proposed new time…"
              : "Reason for requesting cancellation…"
          }
          className="w-full min-h-[80px] border border-border rounded-lg px-3 py-2 text-xs font-[inherit] resize-y focus:outline-none focus:border-primary mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg bg-surface text-text text-xs font-semibold hover:bg-[#e2e0d8] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason || (isReschedule ? "Reschedule requested." : "Decline requested."))}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 ${
              isReschedule ? "bg-[#5b6ea8]" : "bg-[#b0454b]"
            }`}
          >
            {isSubmitting ? "Sending…" : "Send to admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
