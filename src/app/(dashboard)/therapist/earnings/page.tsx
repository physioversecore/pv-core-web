"use client";

import { useState, useEffect } from "react";
import { npr } from "@/lib/cart";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { usePagination } from "@/hooks/usePagination";
import {
  useTherapistTransactions,
  useTherapistPayouts,
} from "@/hooks/useTherapistEarnings";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { X, Wallet, AlertCircle, CheckCircle2, ChevronDown, Calendar } from "lucide-react";

const TABS = [
  "earningsTabsThisMonth",
  "earningsTabsLastMonth",
  "earningsTabsAllTime",
] as const;

type TabValue = (typeof TABS)[number];

const TAB_PERIOD_MAP: Record<TabValue, string> = {
  earningsTabsThisMonth: "thisMonth",
  earningsTabsLastMonth: "lastMonth",
  earningsTabsAllTime: "all",
};

const MIN_PAYOUT = 500;

interface PayoutDestination {
  id: string;
  method: "eSewa" | "Khalti" | "Bank transfer";
  account: string;
  label: string;
}

const PAYOUT_DESTINATIONS: PayoutDestination[] = [
  { id: "d1", method: "eSewa", account: "98XXXXXX21", label: "eSewa — 98XXXXXX21" },
  { id: "d2", method: "Khalti", account: "98XXXXXX99", label: "Khalti — 98XXXXXX99" },
  { id: "d3", method: "Bank transfer", account: "NIC Asia ••4521", label: "NIC Asia Bank ••4521" },
];

const PAYOUT_METHODS = ["eSewa", "Khalti", "Bank transfer"] as const;
const SESSION_TYPES = ["In-clinic", "Home visit", "Telehealth"] as const;

const SEED_TRANSACTIONS = [
  { id: "tx1", date: "2026-07-10", patient: "Sita Sharma", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx2", date: "2026-07-10", patient: "Ram Thapa", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx3", date: "2026-07-09", patient: "Gita Magar", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx4", date: "2026-07-08", patient: "Hari Bahadur", sessionType: "In-clinic", fee: 1500, status: "Scheduled" as const },
  { id: "tx5", date: "2026-07-07", patient: "Anita Gurung", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx6", date: "2026-07-05", patient: "Binod Karki", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx7", date: "2026-07-04", patient: "Sunita Rai", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx8", date: "2026-07-03", patient: "Prakash Tamang", sessionType: "In-clinic", fee: 1500, status: "Cancelled" as const },
  { id: "tx9", date: "2026-07-02", patient: "Kamala Shrestha", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx10", date: "2026-07-01", patient: "Rajesh Adhikari", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx11", date: "2026-06-30", patient: "Laxmi Bhattarai", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx12", date: "2026-06-28", patient: "Deepak Maharjan", sessionType: "Home visit", fee: 2500, status: "Completed" as const },
  { id: "tx13", date: "2026-06-25", patient: "Nirmala Khadka", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
  { id: "tx14", date: "2026-06-20", patient: "Suman Basnet", sessionType: "Telehealth", fee: 1000, status: "Completed" as const },
  { id: "tx15", date: "2026-06-18", patient: "Mina Koirala", sessionType: "In-clinic", fee: 1500, status: "Completed" as const },
];

const SEED_PAYOUTS = [
  { ref: "PAY-2026-071", date: "2026-07-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 12000, status: "Paid" as const },
  { ref: "PAY-2026-065", date: "2026-06-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 9500, status: "Paid" as const },
  { ref: "PAY-2026-059", date: "2026-06-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 15000, status: "Paid" as const },
  { ref: "PAY-2026-052", date: "2026-06-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 8000, status: "Paid" as const },
  { ref: "PAY-2026-048", date: "2026-05-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 11000, status: "Paid" as const },
  { ref: "PAY-2026-045", date: "2026-05-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 7500, status: "Paid" as const },
  { ref: "PAY-2026-041", date: "2026-05-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 13000, status: "Paid" as const },
  { ref: "PAY-2026-038", date: "2026-04-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 6000, status: "Paid" as const },
  { ref: "PAY-2026-034", date: "2026-04-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 14500, status: "Paid" as const },
  { ref: "PAY-2026-030", date: "2026-04-08", method: "eSewa" as const, account: "98XXXXXX21", amount: 10000, status: "Paid" as const },
  { ref: "PAY-2026-027", date: "2026-03-28", method: "Khalti" as const, account: "98XXXXXX99", amount: 8500, status: "Paid" as const },
  { ref: "PAY-2026-022", date: "2026-03-18", method: "Bank transfer" as const, account: "NIC Asia ••4521", amount: 16000, status: "Paid" as const },
];

function hasActiveFilters({
  dateFrom,
  dateTo,
  method,
  sessionType,
}: {
  dateFrom: string;
  dateTo: string;
  method: string;
  sessionType: string;
}) {
  return !!(dateFrom || dateTo || method || sessionType);
}

function matchesPayoutFilters(
  p: { date: string; method: string },
  dateFrom: string,
  dateTo: string,
  method: string,
) {
  if (method && p.method !== method) return false;
  if (dateFrom && p.date < dateFrom) return false;
  if (dateTo && p.date > dateTo) return false;
  return true;
}

function matchesTxFilters(
  tx: { date: string; sessionType: string },
  dateFrom: string,
  dateTo: string,
  sessionType: string,
) {
  if (sessionType && tx.sessionType !== sessionType) return false;
  if (dateFrom && tx.date < dateFrom) return false;
  if (dateTo && tx.date > dateTo) return false;
  return true;
}

function FilterBar({
  hasFilters,
  onClear,
  children,
}: {
  hasFilters: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-4 py-3 border-b border-border bg-surface/30">
      {children}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );
}

function PageControls({
  pagination,
  total,
}: {
  pagination: ReturnType<typeof usePagination>;
  total: number;
}) {
  const totalPages = pagination.totalPages(total);

  if (total <= 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-xs text-text-light">
        Showing {pagination.skip + 1}–
        {Math.min(pagination.skip + pagination.pageSize, total)} of {total}
      </span>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                pagination.prevPage();
              }}
              aria-disabled={!pagination.canPrev}
              className={
                !pagination.canPrev
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              if (Math.abs(p - pagination.page) <= 1) return true;
              return false;
            })
            .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                acc.push("ellipsis");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={item === pagination.page}
                    onClick={(e) => {
                      e.preventDefault();
                      pagination.goToPage(item);
                    }}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                pagination.nextPage(total);
              }}
              aria-disabled={!pagination.canNext(total)}
              className={
                !pagination.canNext(total)
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function TableSkeleton({ colSpan }: { colSpan: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={`skeleton-${i}`}>
          {Array.from({ length: colSpan }).map((_, j) => (
            <td key={j} className="p-3">
              <div className="h-4 w-full bg-surface rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function Earnings() {
  const { t } = useLang();
  const [tab, setTab] = useState<TabValue>("earningsTabsThisMonth");
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const [payoutDateFrom, setPayoutDateFrom] = useState("");
  const [payoutDateTo, setPayoutDateTo] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");

  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");
  const [txSessionType, setTxSessionType] = useState("");

  const period = TAB_PERIOD_MAP[tab];

  const txPagination = usePagination({ pageSize: 10 });
  const payoutPagination = usePagination({ pageSize: 10 });

  const { isLoading: txLoading } =
    useTherapistTransactions({ pagination: txPagination, period });
  const { isLoading: payoutLoading } =
    useTherapistPayouts({ pagination: payoutPagination, period });

  useEffect(() => {
    txPagination.reset();
    payoutPagination.reset();
  }, [tab]);

  useEffect(() => {
    payoutPagination.reset();
  }, [payoutDateFrom, payoutDateTo, payoutMethod]);

  useEffect(() => {
    txPagination.reset();
  }, [txDateFrom, txDateTo, txSessionType]);

  const allPayouts = SEED_PAYOUTS.filter((p) => {
    if (period !== "all") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      if (period === "lastMonth") start.setMonth(start.getMonth() - 1);
      if (new Date(p.date) < start) return false;
    }
    return matchesPayoutFilters(p, payoutDateFrom, payoutDateTo, payoutMethod);
  });

  const allTransactions = SEED_TRANSACTIONS.filter((tx) => {
    if (period !== "all") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      if (period === "lastMonth") start.setMonth(start.getMonth() - 1);
      if (new Date(tx.date) < start) return false;
    }
    return matchesTxFilters(tx, txDateFrom, txDateTo, txSessionType);
  });

  const filteredPayoutTotal = allPayouts.length;
  const filteredPayouts = allPayouts.slice(payoutPagination.skip, payoutPagination.skip + payoutPagination.pageSize);

  const filteredTxTotal = allTransactions.length;
  const filteredTransactions = allTransactions.slice(txPagination.skip, txPagination.skip + txPagination.pageSize);

  const gross = allTransactions.reduce((s, tx) => s + tx.fee, 0);
  const fee = Math.round(gross * 0.15);
  const net = gross - fee;

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
        <Stat
          label={t("therapist_dashboard.payouts")}
          value={String(filteredPayoutTotal)}
        />
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
          <span className="chip">
            {filteredPayoutTotal} {t("therapist_dashboard.entries")}
          </span>
        </div>

        <FilterBar
          hasFilters={hasActiveFilters({ dateFrom: payoutDateFrom, dateTo: payoutDateTo, method: payoutMethod, sessionType: "" })}
          onClear={() => { setPayoutDateFrom(""); setPayoutDateTo(""); setPayoutMethod(""); }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-light whitespace-nowrap">From</span>
            <div className="relative">
              <input
                type="date"
                value={payoutDateFrom}
                onChange={(e) => setPayoutDateFrom(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-light whitespace-nowrap">To</span>
            <div className="relative">
              <input
                type="date"
                value={payoutDateTo}
                onChange={(e) => setPayoutDateTo(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
            </div>
          </div>
          <div className="relative">
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Methods</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>
        </FilterBar>

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
              {payoutLoading ? (
                <TableSkeleton colSpan={6} />
              ) : filteredPayouts.length === 0 ? (
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
        <PageControls pagination={payoutPagination} total={filteredPayoutTotal} />
      </div>

      <div className="card-soft p-5 mb-5">
        <div className="section-header">
          <div>
            <p className="eyebrow mb-1">Breakdown</p>
            <h3 className="section-title">Session earnings</h3>
          </div>
          <span className="chip">{filteredTxTotal} sessions</span>
        </div>

        <FilterBar
          hasFilters={hasActiveFilters({ dateFrom: txDateFrom, dateTo: txDateTo, method: "", sessionType: txSessionType })}
          onClear={() => { setTxDateFrom(""); setTxDateTo(""); setTxSessionType(""); }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-light whitespace-nowrap">From</span>
            <div className="relative">
              <input
                type="date"
                value={txDateFrom}
                onChange={(e) => setTxDateFrom(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-light whitespace-nowrap">To</span>
            <div className="relative">
              <input
                type="date"
                value={txDateTo}
                onChange={(e) => setTxDateTo(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
            </div>
          </div>
          <div className="relative">
            <select
              value={txSessionType}
              onChange={(e) => setTxSessionType(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Types</option>
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>
        </FilterBar>

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
              {txLoading ? (
                <TableSkeleton colSpan={5} />
              ) : filteredTransactions.length === 0 ? (
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
        <PageControls pagination={txPagination} total={filteredTxTotal} />
      </div>

      <button onClick={() => setShowPayoutModal(true)} className="btn-primary">
        {t("therapist_dashboard.requestPayout")}
      </button>

      {showPayoutModal && (
        <PayoutModal
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

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card-soft p-4 ${highlight ? "card-highlight-stat" : ""}`}>
      <div className={`stat-label ${highlight ? "text-white/70" : "text-text-light"}`}>
        {label}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function PayoutModal({
  destinations,
  onClose,
  onSuccess,
}: {
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
  const isValid = amount !== "" && !isNaN(parsed) && parsed >= MIN_PAYOUT;

  function handleChange(val: string) {
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return;
    setAmount(val);
    const num = Number(val);
    if (val === "" || isNaN(num)) {
      setError("");
    } else if (num < MIN_PAYOUT) {
      setError(`Minimum payout is ${npr(MIN_PAYOUT)}`);
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
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-surface"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary-light grid place-items-center">
            <Wallet size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg">Withdraw Funds</h3>
            <p className="text-sm text-text-light">
              Request a payout to your linked account
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-text-light mb-1.5 block">
            Withdrawal amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm font-medium">
              Rs
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="0"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-lg font-medium outline-none transition-colors ${
                error
                  ? "border-danger focus:border-danger"
                  : "border-border focus:border-primary"
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
          <label className="text-xs font-medium text-text-light mb-1.5 block">
            Payout destination
          </label>
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
