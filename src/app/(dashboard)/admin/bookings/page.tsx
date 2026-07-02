"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface Booking { id: string; patient: string; therapist: string; when: string; location: string; status: "Confirmed" | "Pending" | "Completed" | "Cancelled"; }
const SEED: Booking[] = [
  { id: "BK-1041", patient: "Sita Gurung", therapist: "Rajesh Shrestha", when: "23 Jun · 4:00 PM", location: "Baneshwor", status: "Confirmed" },
  { id: "BK-1040", patient: "Hari Bahadur Rai", therapist: "Rajesh Shrestha", when: "23 Jun · 1:00 PM", location: "Patan", status: "Confirmed" },
  { id: "BK-1039", patient: "Nabin Khadka", therapist: "Anita Tamang", when: "30 Jun · 10:00 AM", location: "Kalanki", status: "Pending" },
  { id: "BK-1038", patient: "Puja Maharjan", therapist: "Sujan Karki", when: "20 Jun · 2:00 PM", location: "Bhaktapur", status: "Completed" },
  { id: "BK-1037", patient: "Sita Gurung", therapist: "Rajesh Shrestha", when: "17 Jun · 4:00 PM", location: "Baneshwor", status: "Completed" },
];
const STATUSES = ["All statuses", "Confirmed", "Pending", "Completed", "Cancelled"] as const;

export default function AdminBookings() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All statuses");
  const view = useMemo(() => rows.filter((r) =>
    (filter === "All statuses" || r.status === filter) &&
    [r.id, r.patient, r.therapist, r.location].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [rows, q, filter]);

  const update = (id: string, status: Booking["status"], msg: string) => {
    setRows((r) => r.map((b) => b.id === id ? { ...b, status } : b));
    toast.success(msg);
  };

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">All bookings</h3>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-3 py-2 rounded-full border border-border bg-cream text-sm">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 rounded-full border border-border bg-cream text-sm w-44" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-slate text-left border-b border-border">
                <th className="py-2 pr-3">Booking ID</th><th className="py-2 pr-3">Patient</th><th className="py-2 pr-3">Therapist</th>
                <th className="py-2 pr-3">Date & time</th><th className="py-2 pr-3">Location</th><th className="py-2 pr-3">Status</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {view.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 pr-3 font-mono text-xs text-pine">#{b.id}</td>
                  <td className="py-3 pr-3 font-medium">{b.patient}</td>
                  <td className="py-3 pr-3 text-slate">{b.therapist}</td>
                  <td className="py-3 pr-3 text-slate">{b.when}</td>
                  <td className="py-3 pr-3 text-slate">{b.location}</td>
                  <td className="py-3 pr-3"><StatusChip status={b.status} /></td>
                  <td className="py-3">
                    <div className="flex gap-1.5">
                      {b.status === "Pending" && (
                        <>
                          <button onClick={() => update(b.id, "Confirmed", "Booking confirmed")} className="chip !bg-pine/10 !text-pine cursor-pointer">Confirm</button>
                          <button onClick={() => update(b.id, "Cancelled", "Booking cancelled")} className="chip !bg-destructive/10 !text-destructive cursor-pointer">Cancel</button>
                        </>
                      )}
                      {b.status === "Confirmed" && (
                        <>
                          <button onClick={() => toast("Reschedule request sent")} className="chip !bg-amber/15 !text-amber cursor-pointer">Reschedule</button>
                          <button onClick={() => update(b.id, "Cancelled", "Booking cancelled")} className="chip !bg-destructive/10 !text-destructive cursor-pointer">Cancel</button>
                        </>
                      )}
                      {(b.status === "Completed" || b.status === "Cancelled") && <span className="text-slate text-xs">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Booking["status"] }) {
  const map = {
    Confirmed: "!bg-pine/10 !text-pine",
    Pending: "!bg-amber/15 !text-amber",
    Completed: "!bg-sage !text-pine",
    Cancelled: "!bg-destructive/10 !text-destructive",
  } as const;
  return <span className={`chip ${map[status]}`}>{status}</span>;
}
