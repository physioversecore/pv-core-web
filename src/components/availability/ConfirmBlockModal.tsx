"use client";

import { cn } from "@/utils/cn";

interface ConfirmBlockModalProps {
  open: boolean;
  title: string;
  body: string;
  patients?: { name: string; slot: string }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmBlockModal({
  open,
  title,
  body,
  patients,
  onConfirm,
  onCancel,
}: ConfirmBlockModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center z-50",
        open ? "flex" : "hidden"
      )}
      style={{ background: "rgba(20,26,24,.45)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[14px] p-[26px] w-[420px] max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-semibold mb-1">{title}</h3>
        <p className="text-[13.5px] text-text-light leading-relaxed">{body}</p>

        {patients && patients.length > 0 && (
          <div className="bg-background rounded-lg p-3 mt-2.5 max-h-[120px] overflow-auto text-[12.5px]">
            {patients.map((p, i) => (
              <div key={i} className="py-0.5">
                <span className="font-medium">{p.name}</span> · {p.slot}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-[18px]">
          <button
            onClick={onCancel}
            className="px-4 py-[9px] rounded-lg border border-border bg-white text-[13px] text-text cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-[9px] rounded-[9px] bg-danger text-white text-[13px] font-bold cursor-pointer"
          >
            Confirm block
          </button>
        </div>
      </div>
    </div>
  );
}
