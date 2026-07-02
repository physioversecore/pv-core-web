"use client";

import { useState } from "react";
import { npr } from "@/lib/cart";
import { toast } from "sonner";

const TABS = ["This Month", "Last Month", "All Time"] as const;

interface Payout { date: string; ref: string; method: "eSewa" | "Khalti" | "Bank transfer"; account: string; amount: number; status: "Paid" | "Processing" | "Failed" }
const PAYOUTS: Payout[] = [
  { date: "2026-06-25", ref: "PO-2026-0412", method: "eSewa", account: "98XXXXXX21", amount: 38250, status: "Paid" },
  { date: "2026-05-26", ref: "PO-2026-0388", method: "Bank transfer", account: "NIC Asia ••4521", amount: 41500, status: "Paid" },
  { date: "2026-04-25", ref: "PO-2026-0341", method: "Khalti", account: "98XXXXXX21", amount: 35200, status: "Paid" },
  { date: "2026-06-28", ref: "PO-2026-0431", method: "eSewa", account: "98XXXXXX21", amount: 12750, status: "Processing" },
];
const TXN = [{ fee: 5600 }, { fee: 5600 }, { fee: 5600 }, { fee: 5600 }];

export default function Earnings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("This Month");
  const gross = TXN.reduce((s, t) => s + t.fee, 0);
  const fee = Math.round(gross * 0.15);
  const net = gross - fee;

  return (
    <>
      <div className="flex gap-1 p-1 bg-sage rounded-full mb-5 w-fit">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === t ? "bg-white text-pine shadow-sm" : "text-slate"}`}>{t}</button>)}
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-5">
        <Stat label="Payouts" value={String(PAYOUTS.length)} />
        <Stat label="Gross earnings" value={npr(gross)} />
        <Stat label="Platform fee (15%)" value={npr(fee)} />
        <Stat label="Net payout" value={npr(net)} highlight />
      </div>

      <div className="card-soft p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="eyebrow mb-1">Withdrawal history</p>
            <h3 className="font-display text-lg">Payouts to your account</h3>
          </div>
          <span className="chip">{PAYOUTS.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider font-mono text-slate text-left border-b border-border">
              <tr><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Reference</th><th className="py-2 pr-3">Method</th><th className="py-2 pr-3">Account</th><th className="py-2 pr-3 text-right">Amount</th><th className="py-2 pr-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PAYOUTS.map((p) => (
                <tr key={p.ref}>
                  <td className="py-3 pr-3 text-slate">{p.date}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-pine">{p.ref}</td>
                  <td className="py-3 pr-3">{p.method}</td>
                  <td className="py-3 pr-3 font-mono text-xs text-slate">{p.account}</td>
                  <td className="py-3 pr-3 text-right font-medium">{npr(p.amount)}</td>
                  <td className="py-3 pr-3">
                    <span className={`chip ${p.status === "Paid" ? "!bg-pine !text-white" : p.status === "Processing" ? "!bg-amber/15 !text-amber" : "!bg-red-100 !text-red-700"}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => toast.success("Payout request submitted")} className="btn-primary">Request payout</button>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card-soft p-4 ${highlight ? "!bg-pine !text-white !border-pine" : ""}`}>
      <div className={`text-xs uppercase tracking-wider font-mono ${highlight ? "text-white/70" : "text-slate"}`}>{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}
