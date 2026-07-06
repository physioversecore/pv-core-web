"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Search, Star, Download } from "lucide-react";
import { toast } from "sonner";

interface Row { id: string; name: string; city: string; specialty: string; rating: number; sessions: number; status: "Verified" | "Under review" | "Suspended"; }
const ROWS: Row[] = [
  { id: "1", name: "Rajesh Shrestha", city: "Lalitpur", specialty: "Sports & post-surgery", rating: 4.9, sessions: 312, status: "Verified" },
  { id: "2", name: "Anita Tamang", city: "Kathmandu", specialty: "Geriatric & neuro", rating: 4.8, sessions: 214, status: "Verified" },
  { id: "3", name: "Sujan Karki", city: "Bhaktapur", specialty: "Musculoskeletal", rating: 4.7, sessions: 98, status: "Verified" },
  { id: "4", name: "Priya Manandhar", city: "Pokhara", specialty: "Pediatric rehab", rating: 4.9, sessions: 187, status: "Verified" },
  { id: "5", name: "Binod Khatri", city: "Lalitpur", specialty: "Sports injury", rating: 3.8, sessions: 22, status: "Under review" },
];

export default function AdminTherapists() {
  const [q, setQ] = useState("");
  const [data, setData] = useState(ROWS);
  const rows = useMemo(() => data.filter((r) => [r.name, r.city, r.specialty].join(" ").toLowerCase().includes(q.toLowerCase())), [data, q]);

  const toggle = (id: string) => {
    setData((d) => d.map((r) => r.id !== id ? r : { ...r, status: r.status === "Under review" ? "Verified" : r.status === "Verified" ? "Suspended" : "Verified" }));
    toast.success("Status updated");
  };

  const exportCsv = () => {
    const header = "Name,City,Specialty,Rating,Sessions,Status\n";
    const body = data.map((r) => `${r.name},${r.city},${r.specialty},${r.rating},${r.sessions},${r.status}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "therapists.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">All physiotherapists</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search therapist…" className="pl-9 pr-3 py-2 rounded-full border border-border bg-background text-sm w-56" />
            </div>
            <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs"><Download size={14} /> Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">City</th><th className="py-2 pr-3">Specialty</th>
                <th className="py-2 pr-3">Rating</th><th className="py-2 pr-3">Sessions</th><th className="py-2 pr-3">Status</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.name} size={28} />
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-text-light">{r.city}</td>
                  <td className="py-3 pr-3 text-text-light">{r.specialty}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1 text-primary">
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={11} className={n <= Math.round(r.rating) ? "fill-primary text-primary" : "text-border"} />)}
                      <span className="ml-1 text-text font-mono text-xs">{r.rating}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-mono text-xs">{r.sessions}</td>
                  <td className="py-3 pr-3">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="py-3">
                    {r.status === "Under review"
                      ? <button onClick={() => toggle(r.id)} className="chip !bg-secondary !text-white cursor-pointer">Verify</button>
                      : <button onClick={() => toggle(r.id)} className="chip !bg-destructive/15 !text-destructive cursor-pointer">{r.status === "Suspended" ? "Reinstate" : "Suspend"}</button>}
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

function StatusChip({ status }: { status: Row["status"] }) {
  const map = {
    "Verified": "!bg-secondary/10 !text-secondary",
    "Under review": "!bg-primary/15 !text-primary",
    "Suspended": "!bg-destructive/10 !text-destructive",
  } as const;
  return <span className={`chip ${map[status]}`}>{status}</span>;
}
