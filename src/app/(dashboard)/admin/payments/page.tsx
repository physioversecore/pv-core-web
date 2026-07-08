"use client";

import { useState } from "react";
import { npr } from "@/lib/cart";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

interface Txn { id: string; patient: string; therapist: string; amount: number; method: "eSewa" | "Khalti" | "Cash" | "Bank"; status: "Paid" | "Pending" | "Refunded"; }
const SEED: Txn[] = [
  { id: "BK-1041", patient: "Sita Gurung", therapist: "Rajesh Shrestha", amount: 1200, method: "eSewa", status: "Paid" },
  { id: "BK-1040", patient: "Hari Bahadur Rai", therapist: "Rajesh Shrestha", amount: 1200, method: "Khalti", status: "Paid" },
  { id: "BK-1039", patient: "Nabin Khadka", therapist: "Anita Tamang", amount: 1500, method: "Cash", status: "Pending" },
  { id: "BK-1038", patient: "Puja Maharjan", therapist: "Sujan Karki", amount: 1000, method: "eSewa", status: "Paid" },
];

export default function AdminPayments() {
  const { t } = useLang();
  const [rows, setRows] = useState(SEED);

  const decide = (id: string, ok: boolean) => {
    setRows((r) => r.map((tx) => tx.id === id ? { ...tx, status: ok ? "Paid" : "Refunded" } : tx));
    toast.success(ok ? t("admin_dashboard.paymentApproved") : t("admin_dashboard.paymentRejected"));
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label={t("admin_dashboard.revenueThisMonth")} value="Rs 2.4L" sub={<span className="text-secondary inline-flex items-center gap-1"><TrendingUp size={12} /> 18% vs last month</span>} />
        <Kpi label={t("admin_dashboard.platformCommission")} value="Rs 24K" sub={t("admin_dashboard.commissionDesc")} />
        <Kpi label={t("admin_dashboard.pendingPayouts")} value="Rs 78K" sub={t("admin_dashboard.pendingPayoutsDesc")} amber />
        <Kpi label={t("admin_dashboard.disputes")} value="2" sub={t("admin_dashboard.disputesDesc")} />
      </div>

      <div className="card-soft p-5">
        <h3 className="font-display text-xl mb-4">{t("admin_dashboard.recentTransactions")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-3">{t("admin_dashboard.booking")}</th><th className="py-2 pr-3">{t("admin_dashboard.patient")}</th><th className="py-2 pr-3">{t("admin_dashboard.therapist")}</th>
                <th className="py-2 pr-3">{t("admin_dashboard.amount")}</th><th className="py-2 pr-3">{t("admin_dashboard.method")}</th><th className="py-2 pr-3">{t("admin_dashboard.status")}</th><th className="py-2">{t("admin_dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 pr-3 font-mono text-xs text-secondary">#{tx.id}</td>
                  <td className="py-3 pr-3 font-medium">{tx.patient}</td>
                  <td className="py-3 pr-3 text-text-light">{tx.therapist}</td>
                  <td className="py-3 pr-3">{npr(tx.amount)}</td>
                  <td className="py-3 pr-3 text-text-light">{tx.method}</td>
                  <td className="py-3 pr-3"><StatusChip status={tx.status} /></td>
                  <td className="py-3">
                    {tx.status === "Pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => decide(tx.id, true)} className="chip !bg-secondary !text-white cursor-pointer">{t("admin_dashboard.approve")}</button>
                        <button onClick={() => decide(tx.id, false)} className="chip !bg-destructive/10 !text-destructive cursor-pointer">{t("admin_dashboard.reject")}</button>
                      </div>
                    ) : <span className="text-text-light text-xs">—</span>}
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
      <div className={`font-display text-2xl ${amber ? "text-primary" : "text-text"}`}>{value}</div>
      <div className="text-xs text-text-light mt-1.5">{sub}</div>
    </div>
  );
}

function StatusChip({ status }: { status: Txn["status"] }) {
  const { t } = useLang();
  const map = {
    Paid: "!bg-secondary/10 !text-secondary",
    Pending: "!bg-primary/15 !text-primary",
    Refunded: "!bg-destructive/10 !text-destructive",
  } as const;
  const label: Record<string, string> = {
    Paid: t("admin_dashboard.paid"),
    Pending: t("admin_dashboard.pending"),
    Refunded: t("admin_dashboard.refunded"),
  };
  return <span className={`chip ${map[status]}`}>{label[status]}</span>;
}
