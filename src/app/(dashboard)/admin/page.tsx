"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminOverview() {
  const [pending, setPending] = useState([
    { id: "a1", name: "Dr. Pratap Joshi", date: "2026-06-26", city: "Pokhara", license: true, cert: true },
    { id: "a2", name: "Dr. Mina Karki", date: "2026-06-25", city: "Kathmandu", license: true, cert: false },
    { id: "a3", name: "Dr. Sushil Rana", date: "2026-06-24", city: "Lalitpur", license: true, cert: true },
  ]);

  const act = (id: string, ok: boolean) => {
    setPending((p) => p.filter((x) => x.id !== id));
    toast.success(ok ? "Therapist verified" : "Application rejected");
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Total therapists" value="184" />
        <Stat label="Total patients" value="1,247" />
        <Stat label="Sessions this week" value="312" />
        <Stat label="Pending verifications" value={String(pending.length)} amber />
      </div>

      <div className="card-soft p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">Pending verifications</h3>
          <Link href="/admin/therapists" className="text-xs text-pine hover:underline">All therapists</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sage/60 text-xs uppercase font-mono text-slate text-left">
              <tr><th className="p-2">Name</th><th className="p-2">Applied</th><th className="p-2">City</th><th className="p-2">License</th><th className="p-2">Certificate</th><th className="p-2"></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pending.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 font-medium">{p.name}</td>
                  <td className="p-2 text-slate">{p.date}</td>
                  <td className="p-2 text-slate">{p.city}</td>
                  <td className="p-2">{p.license ? "✓" : "✗"}</td>
                  <td className="p-2">{p.cert ? "✓" : "✗"}</td>
                  <td className="p-2 flex gap-1 justify-end">
                    <button onClick={() => act(p.id, true)} className="btn-pine !py-1 !px-3 text-xs">Verify</button>
                    <button onClick={() => act(p.id, false)} className="btn-outline !py-1 !px-3 text-xs">Reject</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate text-sm">No pending applications.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-soft p-5">
          <h3 className="font-display text-lg mb-3">Platform earnings</h3>
          <div className="text-3xl font-display text-pine">Rs 5,42,300</div>
          <p className="text-xs text-slate mt-1">This month (15% platform fee)</p>
        </div>
        <div className="card-soft p-5">
          <h3 className="font-display text-lg mb-3">Recent bookings</h3>
          <ul className="text-sm space-y-2 text-slate">
            <li>· Ramesh A. booked Dr. Aarati S. — 2 min ago</li>
            <li>· Sita L. rebooked Dr. Bibek T. — 14 min ago</li>
            <li>· Hari P. cancelled session — 1 hr ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, amber }: { label: string; value: string; amber?: boolean }) {
  return (
    <div className={`card-soft p-4 ${amber ? "!border-amber !bg-amber/5" : ""}`}>
      <div className="text-xs uppercase tracking-wider font-mono text-slate">{label}</div>
      <div className={`font-display text-2xl mt-1 ${amber ? "text-amber" : ""}`}>{value}</div>
    </div>
  );
}
