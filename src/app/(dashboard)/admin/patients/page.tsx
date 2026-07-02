"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Search } from "lucide-react";
import { toast } from "sonner";

const PATIENTS = [
  { id: "u1", name: "Sita Gurung", city: "Lalitpur", sessions: 12, therapist: "Rajesh Shrestha", joined: "Jan 2026" },
  { id: "u2", name: "Hari Bahadur Rai", city: "Kathmandu", sessions: 7, therapist: "Rajesh Shrestha", joined: "Mar 2026" },
  { id: "u3", name: "Nabin Khadka", city: "Kathmandu", sessions: 2, therapist: "Anita Tamang", joined: "Jun 2026" },
  { id: "u4", name: "Puja Maharjan", city: "Bhaktapur", sessions: 5, therapist: "Sujan Karki", joined: "Apr 2026" },
];

export default function AdminPatients() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => PATIENTS.filter((p) => [p.name, p.city, p.therapist].join(" ").toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">All patients</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient…" className="pl-9 pr-3 py-2 rounded-full border border-border bg-cream text-sm w-56" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-slate text-left border-b border-border">
                <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">City</th><th className="py-2 pr-3">Sessions</th>
                <th className="py-2 pr-3">Therapist</th><th className="py-2 pr-3">Joined</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size={28} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate">{p.city}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{p.sessions}</td>
                  <td className="py-3 pr-3 text-slate">{p.therapist}</td>
                  <td className="py-3 pr-3 text-slate">{p.joined}</td>
                  <td className="py-3 flex gap-1.5">
                    <button onClick={() => toast("Opened patient profile")} className="chip !bg-pine/10 !text-pine cursor-pointer">View profile</button>
                    <button onClick={() => toast("Reschedule sent")} className="chip !bg-amber/15 !text-amber cursor-pointer">Reschedule</button>
                    <button onClick={() => toast.error("Patient deactivated")} className="btn-outline !py-1 !px-3 text-xs">Deactivate</button>
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
