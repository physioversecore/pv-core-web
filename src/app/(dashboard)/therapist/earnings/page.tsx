"use client";

import { useState } from "react";
import { npr } from "@/lib/cart";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const TABS = ["earningsTabsThisMonth", "earningsTabsLastMonth", "earningsTabsAllTime"] as const;

interface Payout { date: string; ref: string; method: "eSewa" | "Khalti" | "Bank transfer"; account: string; amount: number; status: "Paid" | "Processing" | "Failed" }
const PAYOUTS: Payout[] = [
  { date: "2026-06-25", ref: "PO-2026-0412", method: "eSewa", account: "98XXXXXX21", amount: 38250, status: "Paid" },
  { date: "2026-05-26", ref: "PO-2026-0388", method: "Bank transfer", account: "NIC Asia ••4521", amount: 41500, status: "Paid" },
  { date: "2026-04-25", ref: "PO-2026-0341", method: "Khalti", account: "98XXXXXX21", amount: 35200, status: "Paid" },
  { date: "2026-06-28", ref: "PO-2026-0431", method: "eSewa", account: "98XXXXXX21", amount: 12750, status: "Processing" },
];
const TXN = [{ fee: 5600 }, { fee: 5600 }, { fee: 5600 }, { fee: 5600 }];

export default function Earnings() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]>("earningsTabsThisMonth");
  const gross = TXN.reduce((s, t) => s + t.fee, 0);
  const fee = Math.round(gross * 0.15);
  const net = gross - fee;

  return (
    <>
      <div className="tabs-filter">
        {TABS.map((tabKey) => <button key={tabKey} onClick={() => setTab(tabKey)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${tab === tabKey ? "tab-active" : "text-text-light"}`}>{t(`therapist_dashboard.${tabKey}`)}</button>)}
      </div>

      <div className="stats-grid">
        <Stat label={t("therapist_dashboard.payouts")} value={String(PAYOUTS.length)} />
        <Stat label={t("therapist_dashboard.grossEarnings")} value={npr(gross)} />
        <Stat label={t("therapist_dashboard.platformFee")} value={npr(fee)} />
        <Stat label={t("therapist_dashboard.netPayout")} value={npr(net)} highlight />
      </div>

      <div className="card-soft p-5 mb-5">
        <div className="section-header">
          <div>
            <p className="eyebrow mb-1">{t("therapist_dashboard.withdrawalHistory")}</p>
            <h3 className="section-title">{t("therapist_dashboard.payoutsTitle")}</h3>
          </div>
          <span className="chip">{PAYOUTS.length} {t("therapist_dashboard.entries")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr><th className="table-cell">{t("therapist_dashboard.date")}</th><th className="table-cell">{t("therapist_dashboard.reference")}</th><th className="table-cell">{t("therapist_dashboard.method")}</th><th className="table-cell">{t("therapist_dashboard.account")}</th><th className="table-cell text-right">{t("therapist_dashboard.amount")}</th><th className="table-cell">{t("therapist_dashboard.status")}</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PAYOUTS.map((p) => (
                <tr key={p.ref}>
                  <td className="table-cell text-text-light">{p.date}</td>
                  <td className="table-cell font-mono text-xs text-secondary">{p.ref}</td>
                  <td className="table-cell">{p.method}</td>
                  <td className="table-cell font-mono text-xs text-text-light">{p.account}</td>
                  <td className="table-cell text-right font-medium">{npr(p.amount)}</td>
                  <td className="table-cell">
                    <span className={p.status === "Paid" ? "badge-success" : p.status === "Processing" ? "badge-warning" : "badge-danger"}>{p.status === "Paid" ? t("therapist_dashboard.paid") : p.status === "Processing" ? t("therapist_dashboard.processing") : t("therapist_dashboard.failed")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => toast.success(t("therapist_dashboard.requestPayout"))} className="btn-primary">{t("therapist_dashboard.requestPayout")}</button>
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card-soft p-4 ${highlight ? "card-highlight-stat" : ""}`}>
      <div className={`stat-label ${highlight ? "text-white/70" : "text-text-light"}`}>{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
