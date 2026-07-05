"use client";

import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

const REPORTS = [
  { id: 1, date: "2026-06-20", therapist: "Dr. Aarati Shrestha", type: "Session note", file: "session-2026-06-20.pdf" },
  { id: 2, date: "2026-06-15", therapist: "Dr. Aarati Shrestha", type: "Exercise plan", file: "exercises-week3.pdf" },
  { id: 3, date: "2026-06-08", therapist: "Dr. Aarati Shrestha", type: "Prescription", file: "rx-anti-inflammatory.pdf" },
];

export default function Reports() {
  return (
    <div>
      <div className="card-soft divide-y divide-border">
        {REPORTS.map((r) => (
          <div key={r.id} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface text-secondary grid place-items-center"><FileText size={18} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{r.type}</div>
              <div className="text-xs text-text-light">{r.therapist} · {r.date}</div>
            </div>
            <button onClick={() => toast.success(`Downloaded ${r.file}`)} className="btn-outline !py-1.5 !px-3 text-xs"><Download size={12} /> PDF</button>
          </div>
        ))}
      </div>
    </div>
  );
}
