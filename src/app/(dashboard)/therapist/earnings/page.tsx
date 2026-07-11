"use client";

import { useState, useMemo } from "react";
import { npr } from "@/lib/cart";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { X, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

const TABS = ["earningsTabsThisMonth", "earningsTabsLastMonth", "earningsTabsAllTime"] as const;
const MIN_PAYOUT = 500;

interface Transaction {
  id: string;
  date: string;
  patient: string;
  sessionType: string;
  fee: number;
  status: "Completed" | "Scheduled" | "Cancelled";
}

interface Payout {
  date: string;
  ref: string;
  method: "eSewa" | "Khalti" | "Bank transfer";
  account: string;
  amount: number;
  status: "Paid" | "Processing" | "Failed";
}

interface PayoutDestination {
  id: string;
  method: "eSewa" | "Khalti" | "Bank transfer";
  account: string;
  label: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2026-07-10", patient: "Suman K.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t2", date: "2026-07-08", patient: "Rita M.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t3", date: "2026-07-05", patient: "Arun P.", sessionType: "Clinic", fee: 4800, status: "Completed" },
  { id: "t4", date: "2026-07-02", patient: "Suman K.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t5", date: "2026-06-28", patient: "Deepa S.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t6", date: "2026-06-25", patient: "Bikash R.", sessionType: "Clinic", fee: 4800, status: "Completed" },
  { id: "t7", date: "2026-06-20", patient: "Rita M.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t8", date: "2026-06-15", patient: "Suman K.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t9", date: "2026-06-10", patient: "Arun P.", sessionType: "Clinic", fee: 4800, status: "Completed" },
  { id: "t10", date: "2026-05-28", patient: "Deepa S.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t11", date: "2026-05-20", patient: "Bikash R.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t12", date: "2026-05-15", patient: "Rita M.", sessionType: "Clinic", fee: 4800, status: "Completed" },
  { id: "t13", date: "2026-04-10", patient: "Suman K.", sessionType: "Home visit", fee: 5600, status: "Completed" },
  { id: "t14", date: "2026-03-22", patient: "Arun P.", sessionType: "Home visit", fee: 5600, status: "Completed" },
];

const PAYOUTS: Payout[] = [
  { date: "2026-07-05", ref: "PO-2026-0431", method: "eSewa", account: "98XXXXXX21", amount: 12750, status: "Processing" },
  { date: "2026-06-25", ref: "PO-2026-0412", method: "eSewa", account: "98XXXXXX21", amount: 38250, status: "Paid" },
  { date: "2026-05-26", ref: "PO-2026-0388", method: "Bank transfer", account: "NIC Asia ••4521", amount: 41500, status: "Paid" },
  { date: "2026-04-25", ref: "PO-2026-0341", method: "Khalti", account: "98XXXXXX21", amount: 35200, status: "Paid" },
  { date: "2026-03-20", ref: "PO-2026-0301", method: "eSewa", account: "98XXXXXX21", amount: 22400, status: "Paid" },
];

const PAYOUT_DESTINATIONS: PayoutDestination[] = [
  { id: "d1", method: "eSewa", account: "98XXXXXX21", label: "eSewa — 98XXXXXX21" },
  { id: "d2", method: "Khalti", account: "98XXXXXX99", label: "Khalti — 98XXXXXX99" },
  { id: "d3", method: "Bank transfer", account: "NIC Asia ••4521", label: "NIC Asia Bank ••4521" },
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isInThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const start = startOfMonth(now);
  return d >= start && d <= now;
}

function isInLastMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const start = startOfMonth(prev);
  const end = endOfMonth(prev);
  return d >= start && d <= end;
}

export default function Earnings() {
  const { t } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number]>("earningsTabsThisMonth");
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (tab === "earningsTabsThisMonth") return TRANSACTIONS.filter((tx) => isInThisMonth(tx.date));
    if (tab === "earningsTabsLastMonth") return TRANSACTIONS.filter((tx) => isInLastMonth(tx.date));
    return TRANSACTIONS;
  }, [tab]);

  const filteredPayouts = useMemo(() => {
    if (tab === "earningsTabsThisMonth") return PAYOUTS.filter((p) => isInThisMonth(p.date));
    if (tab === "earningsTabsLastMonth") return PAYOUTS.filter((p) => isInLastMonth(p.date));
    return PAYOUTS;
  }, [tab]);

  const gross = filteredTransactions.reduce((s, tx) => s + tx.fee, 0);
  const fee = Math.round(gross * 0.15);
  const net = gross - fee;

  const totalAllTime = TRANSACTIONS.filter((tx) => tx.status === "Completed").reduce((s, tx) => s + tx.fee, 0);
  const totalAllTimeFee = Math.round(totalAllTime * 0.15);
  const totalPaidOut = PAYOUTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const availableBalance = totalAllTime - totalAllTimeFee - totalPaidOut;

  return (
    <>
      <div className="tabs-filter">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === tabKey ? "tab-active" : "text-text-light hover:text-text"
            }`}
          >
            {t(`therapist_dashboard.${tabKey}`)}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <Stat label={t("therapist_dashboard.payouts")} value={String(filteredPayouts.length)} />
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
          <span className="chip">{filteredPayouts.length} {t("therapist_dashboard.entries")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="table-cell">{t("therapist_dashboard.date")}</th>
                <th className="table-cell">{t("therapist_dashboard.reference")}</th>
                <th className="table-cell">{t("therapist_dashboard.method")}</th>
                <th className="table-cell">{t("therapist_dashboard.account")}</th>
                <th className="table-cell text-right">{t("therapist_dashboard.amount")}</th>
                <th className="table-cell">{t("therapist_dashboard.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-text-light py-8">
                    No payouts for this period
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p.ref}>
                    <td className="table-cell text-text-light">{p.date}</td>
                    <td className="table-cell font-mono text-xs text-secondary">{p.ref}</td>
                    <td className="table-cell">{p.method}</td>
                    <td className="table-cell font-mono text-xs text-text-light">{p.account}</td>
                    <td className="table-cell text-right font-medium">{npr(p.amount)}</td>
                    <td className="table-cell">
                      <span
                        className={
                          p.status === "Paid"
                            ? "badge-success"
                            : p.status === "Processing"
                            ? "badge-warning"
                            : "badge-danger"
                        }
                      >
                        {p.status === "Paid"
                          ? t("therapist_dashboard.paid")
                          : p.status === "Processing"
                          ? t("therapist_dashboard.processing")
                          : t("therapist_dashboard.failed")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-soft p-5 mb-5">
        <div className="section-header">
          <div>
            <p className="eyebrow mb-1">Breakdown</p>
            <h3 className="section-title">Session earnings</h3>
          </div>
          <span className="chip">{filteredTransactions.length} sessions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="table-cell">Date</th>
                <th className="table-cell">Patient</th>
                <th className="table-cell">Type</th>
                <th className="table-cell text-right">Fee</th>
                <th className="table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-text-light py-8">
                    No sessions for this period
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="table-cell text-text-light">{tx.date}</td>
                    <td className="table-cell font-medium">{tx.patient}</td>
                    <td className="table-cell text-text-light">{tx.sessionType}</td>
                    <td className="table-cell text-right font-medium">{npr(tx.fee)}</td>
                    <td className="table-cell">
                      <span
                        className={
                          tx.status === "Completed"
                            ? "badge-success"
                            : tx.status === "Scheduled"
                            ? "badge-warning"
                            : "badge-danger"
                        }
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => setShowPayoutModal(true)} className="btn-primary">
        {t("therapist_dashboard.requestPayout")}
      </button>

      {showPayoutModal && (
        <PayoutModal
          balance={availableBalance}
          destinations={PAYOUT_DESTINATIONS}
          onClose={() => setShowPayoutModal(false)}
          onSuccess={() => {
            setShowPayoutModal(false);
            toast.success("Withdrawal request submitted successfully");
          }}
        />
      )}
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

function PayoutModal({
  balance,
  destinations,
  onClose,
  onSuccess,
}: {
  balance: number;
  destinations: PayoutDestination[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useLang();
  const [amount, setAmount] = useState("");
  const [selectedDest, setSelectedDest] = useState(destinations[0]?.id ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsed = Number(amount);
  const isValid = amount !== "" && !isNaN(parsed) && parsed >= MIN_PAYOUT && parsed <= balance;

  function handleChange(val: string) {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setAmount(val);
    const num = Number(val);
    if (val === "" || isNaN(num)) {
      setError("");
    } else if (num < MIN_PAYOUT) {
      setError(`Minimum payout is ${npr(MIN_PAYOUT)}`);
    } else if (num > balance) {
      setError("Amount exceeds available balance");
    } else {
      setError("");
    }
  }

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-text/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl p-6">
        <button onClick={onClose} className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-surface">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary-light grid place-items-center">
            <Wallet size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg">Withdraw Funds</h3>
            <p className="text-sm text-text-light">Request a payout to your linked account</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 mb-4">
          <p className="stat-label text-text-light mb-1">Available balance</p>
          <p className="stat-value text-secondary">{npr(balance)}</p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-light mb-1.5 block">Withdrawal amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm font-medium">Rs</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="0"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-lg font-medium outline-none transition-colors ${
                error ? "border-danger focus:border-danger" : "border-border focus:border-primary"
              }`}
            />
          </div>
          {error && (
            <p className="flex items-center gap-1 text-xs text-danger mt-1.5">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="text-xs font-medium text-text-light mb-1.5 block">Payout destination</label>
          {destinations.length === 1 ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-surface/50">
              <CheckCircle2 size={16} className="text-secondary" />
              <span className="text-sm font-medium">{destinations[0].label}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {destinations.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedDest === d.id
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="payout-dest"
                    value={d.id}
                    checked={selectedDest === d.id}
                    onChange={() => setSelectedDest(d.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">{d.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-outline flex-1">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {submitting ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
