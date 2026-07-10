"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface CancelConfirmModalProps {
  therapistName: string;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function CancelConfirmModal({
  therapistName,
  onConfirm,
  onClose,
  isPending,
}: CancelConfirmModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background rounded-2xl border border-border shadow-2xl p-6">
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-surface">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red/10 grid place-items-center">
            <AlertTriangle size={20} className="text-red" />
          </div>
          <div>
            <h3 className="font-display text-lg">Cancel session</h3>
            <p className="text-sm text-text-light">
              with {therapistName}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-light mb-4">
          Are you sure you want to cancel this session? This action cannot be undone.
        </p>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-light mb-1 block">
            Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border bg-white text-sm resize-none"
            placeholder="E.g. feeling unwell, schedule conflict..."
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-outline flex-1">
            Keep session
          </button>
          <button
            onClick={() => onConfirm(reason || undefined)}
            disabled={isPending}
            className="btn-primary flex-1 !bg-red !border-red hover:!bg-red/90 disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
