"use client";

import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

interface Slot { day: number; time: string; status: "confirmed" | "pending" | "completed"; patient: string; }
const INITIAL: Slot[] = [
  { day: 0, time: "10:00", status: "confirmed", patient: "Ramesh A." },
  { day: 1, time: "16:00", status: "confirmed", patient: "Sita L." },
  { day: 2, time: "12:00", status: "pending", patient: "Anita S." },
  { day: 3, time: "08:00", status: "completed", patient: "Hari P." },
  { day: 4, time: "14:00", status: "pending", patient: "Krishna M." },
];

export default function Schedule() {
  const { t } = useLang();
  const [slots, setSlots] = useState(INITIAL);

  const decide = (i: number, ok: boolean) => {
    setSlots((p) => p.map((s, idx) => (idx === i ? { ...s, status: ok ? "confirmed" : "completed" } : s)));
    toast.success(ok ? t("therapist_dashboard.slotAccepted") : t("therapist_dashboard.slotDeclined"));
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="eyebrow">{t("therapist_dashboard.scheduleWeek")} 28 Jun 2026</p>
        <button onClick={() => toast(t("therapist_dashboard.blockOffTime"))} className="btn-outline !py-1.5 !px-3 text-xs">{t("therapist_dashboard.blockOffTime")}</button>
      </div>
      <div className="card-soft overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] min-w-[800px]">
          <div className="border-b border-r border-border p-3 text-xs font-mono text-text-light">{t("therapist_dashboard.timeHeader")}</div>
          {DAYS.map((d) => <div key={d} className="border-b border-border p-3 text-sm font-medium">{d}</div>)}
          {HOURS.map((h) => (
            <Fragment key={h}>
              <div className="border-r border-b border-border p-3 text-xs font-mono text-text-light">{h}</div>
              {DAYS.map((_, di) => {
                const idx = slots.findIndex((s) => s.day === di && s.time === h);
                const s = idx >= 0 ? slots[idx] : null;
                return (
                  <div key={di + h} className="border-b border-border p-2 min-h-[64px]">
                    {s && (
                      <div className={`rounded-lg p-2 text-xs ${s.status === "confirmed" ? "bg-secondary text-white" : s.status === "pending" ? "bg-primary/15 text-primary border border-primary" : "bg-surface text-text-light"}`}>
                        <div className="font-medium truncate">{s.patient}</div>
                        <div className="opacity-75">{s.status === "confirmed" ? t("therapist_dashboard.addressPlaceholder") : s.status}</div>
                        {s.status === "pending" && (
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => decide(idx, true)} className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full">✓</button>
                            <button onClick={() => decide(idx, false)} className="text-[10px] border border-secondary text-secondary px-2 py-0.5 rounded-full">✕</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
