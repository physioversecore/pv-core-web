"use client";

import { useState } from "react";
import { npr } from "@/lib/cart";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Txn { id: string; patient: string; therapist: string; amount: number; method: "eSewa" | "Khalti" | "Cash" | "Bank"; status: "Paid" | "Pending" | "Refunded"; }
const SEED: Txn[] = [
  { id: "BK-1041", patient: "Sita Gurung", therapist: "Rajesh Shrestha", amount: 1200, method: "eSewa", status: "Paid" },
  { id: "BK-1040", patient: "Hari Bahadur Rai", therapist: "Rajesh Shrestha", amount: 1200, method: "Khalti", status: "Paid" },
  { id: "BK-1039", patient: "Nabin Khadka", therapist: "Anita Tamang", amount: 1500, method: "Cash", status: "Pending" },
  { id: "BK-1038", patient: "Puja Maharjan", therapist: "Sujan Karki", amount: 1000, method: "eSewa", status: "Paid" },
];

export default function AdminPayments() {
  const [rows, setRows] = useState(SEED);

  const decide = (id: string, ok: boolean) => {
    setRows((r) => r.map((t) => t.id === id ? { ...t, status: ok ? "Paid" : "Refunded" } : t));
    toast.success(ok ? "Payment approved" : "Payment rejected & refunded");
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Revenue this month" value="Rs 2.4L" sub={<span className="text-pine inline-flex items-center gap-1"><TrendingUp size={12} /> 18% vs last month</span>} />
        <Kpi label="Platform commission" value="Rs 24K" sub="10% of total" />
        <Kpi label="Pending payouts" value="Rs 78K" sub="To 12 therapists · Friday" amber />
        <Kpi label="Disputes" value="2" sub="Open refund requests" />
      </div>

      <div className="card-soft p-5">
        <h3 className="font-display text-xl mb-4">Recent transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-slate text-left border-b border-border">
                <th className="py-2 pr-3">Booking</th><th className="py-2 pr-3">Patient</th><th className="py-2 pr-3">Therapist</th>
                <th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Method</th><th className="py-2 pr-3">Status</th><th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 pr-3 font-mono text-xs text-pine">#{t.id}</td>
                  <td className="py-3 pr-3 font-medium">{t.patient}</td>
                  <td className="py-3 pr-3 text-slate">{t.therapist}</td>
                  <td className="py-3 pr-3">{npr(t.amount)}</td>
                  <td className="py-3 pr-3 text-slate">{t.method}</td>
                  <td className="py-3 pr-3"><StatusChip status={t.status} /></td>
                  <td className="py-3">
                    {t.status === "Pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => decide(t.id, true)} className="chip !bg-pine !text-white cursor-pointer">Approve</button>
                        <button onClick={() => decide(t.id, false)} className="chip !bg-destructive/10 !text-destructive cursor-pointer">Reject</button>
                      </div>
                    ) : <span className="text-slate text-xs">—</span>}
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

function Kpi({ label, value, sub, amber }: { label: string; value: string; sub: React.ReactNode; amber?: boolean }) {
  return (
    <div className="card-soft p-5">
      <div className="eyebrow !text-[0.65rem] mb-2">{label}</div>
      <div className={`font-display text-2xl ${amber ? "text-amber" : "text-forest"}`}>{value}</div>
      <div className="text-xs text-slate mt-1.5">{sub}</div>
    </div>
  );
}

function StatusChip({ status }: { status: Txn["status"] }) {
  const map = {
    Paid: "!bg-pine/10 !text-pine",
    Pending: "!bg-amber/15 !text-amber",
    Refunded: "!bg-destructive/10 !text-destructive",
  } as const;
  return <span className={`chip ${map[status]}`}>{status}</span>;
}
