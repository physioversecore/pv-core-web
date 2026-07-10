"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

interface RescheduleModalProps {
  therapistName: string;
  currentDate: string;
  currentTime: string;
  onConfirm: (date: string, time: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function RescheduleModal({
  therapistName,
  currentDate,
  currentTime,
  onConfirm,
  onClose,
  isPending,
}: RescheduleModalProps) {
  const { t } = useLang();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleConfirm = () => {
    if (!date || !time) {
      return toast.error(t("booking.errorCompleteFields"));
    }
    onConfirm(date, time);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-3xl border border-border shadow-2xl p-7">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-surface">
          <X size={18} />
        </button>

        <h3 className="font-display text-lg mb-1">Reschedule session</h3>
        <p className="text-sm text-text-light mb-5">
          with {therapistName} · Currently {currentDate} at {currentTime}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-light">New date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-light">New time</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={`py-2 rounded-xl text-sm border transition ${
                    time === t
                      ? "border-secondary bg-secondary text-white"
                      : "border-border bg-white text-text hover:border-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-outline flex-1">
              Keep original
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending || !date || !time}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              {isPending ? "Rescheduling..." : "Confirm reschedule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
