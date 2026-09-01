"use client";

import { Gift } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { npr } from "@/utils/format";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { CardSkeleton } from "@/components/SuspenseFallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  usePointBalance,
  usePointTransactions,
  useReferralSummary,
} from "@/hooks/usePoints";
import type { ReferralEntry } from "@/services/api/points";

export default function PatientRewardsPage() {
  const { t } = useLang();
  const { balance, isLoading, refetch } = usePointBalance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">{t("rewards.title")}</h2>
        <RefreshButton onRefresh={() => refetch()} isRefreshing={false} />
      </div>

      <ErrorBoundary>
        {isLoading || !balance ? <CardSkeleton /> : <BalanceCard balance={balance} />}
      </ErrorBoundary>

      <ErrorBoundary>
        <InviteSection />
      </ErrorBoundary>

      <ErrorBoundary>
        <ActivityList />
      </ErrorBoundary>
    </div>
  );
}

function BalanceCard({
  balance,
}: {
  balance: NonNullable<ReturnType<typeof usePointBalance>["balance"]>;
}) {
  const { t } = useLang();

  return (
    <section className="card-soft p-6 bg-secondary text-white">
      <p className="eyebrow mb-1 !text-white/70">{t("rewards.yourBalance")}</p>
      <p className="font-display text-4xl">
        {balance.balance.toLocaleString()} {t("rewards.pts")}
      </p>
      <p className="text-sm text-white/80 mt-1">
        ≈ {npr(balance.balance * balance.pointToNpr)} {t("rewards.inCredit")}
      </p>

      {balance.pending > 0 && (
        // Points from a referral are held until the hold period passes, so
        // showing them as spendable would be a lie.
        <p className="text-xs text-white/70 mt-2">
          {t("rewards.pendingNote").replace("{n}", balance.pending.toLocaleString())}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20">
        <Stat label={t("rewards.earned")} value={balance.earned} />
        <Stat label={t("rewards.used")} value={balance.used} />
        <Stat label={t("rewards.referred")} value={balance.referred} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl">{value.toLocaleString()}</p>
      <p className="text-[0.65rem] uppercase tracking-wide text-white/70">{label}</p>
    </div>
  );
}

function InviteSection() {
  const { t } = useLang();
  const { summary, isLoading } = useReferralSummary();

  if (isLoading) return <CardSkeleton />;
  if (!summary) return null;

  const copy = (value: string, message: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(message);
  };

  return (
    <section className="card-soft p-5">
      <p className="eyebrow mb-1">{t("rewards.referAFriend")}</p>
      <h3 className="section-title text-xl">
        {t("rewards.giveGet")
          .replace("{give}", npr(summary.awardPoints))
          .replace("{get}", npr(summary.awardPoints))}
      </h3>
      <p className="text-sm text-text-light mt-1">{t("rewards.referDesc")}</p>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <code className="px-3 py-2 rounded-xl bg-surface font-mono text-sm">
          {summary.code}
        </code>
        <button
          onClick={() => copy(summary.code, t("rewards.codeCopied"))}
          className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
        >
          {t("common.copy")}
        </button>
        <button
          onClick={() => copy(summary.link, t("rewards.linkCopied"))}
          className="btn-primary !py-2 !px-4 text-xs cursor-pointer"
        >
          {t("common.copyInviteLink")}
        </button>
      </div>

      {summary.referrals.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border">
          <p className="eyebrow mb-2">{t("rewards.yourReferrals")}</p>
          <ul className="divide-y divide-border">
            {summary.referrals.map((r) => (
              <ReferralRow key={r.id} entry={r} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ReferralRow({ entry }: { entry: ReferralEntry }) {
  const { t } = useLang();

  const stateLabels: Record<string, string> = {
    INVITED: t("rewards.stateInvited"),
    JOINED: t("rewards.stateJoined"),
    PENDING: t("rewards.statePending"),
    REWARDED: t("rewards.stateRewarded"),
    REVERSED: t("rewards.stateReversed"),
  };

  return (
    <li className="py-2.5 flex items-center justify-between gap-3">
      <span className="text-sm text-text">{entry.name}</span>
      <span className="flex items-center gap-2">
        {entry.points ? (
          <span className="text-sm font-medium text-secondary">
            +{entry.points.toLocaleString()}
          </span>
        ) : null}
        <span className="chip !text-[0.6rem]">
          {stateLabels[entry.state] ?? entry.state}
        </span>
      </span>
    </li>
  );
}

function ActivityList() {
  const { t } = useLang();
  const { transactions, isLoading } = usePointTransactions();

  if (isLoading) return <CardSkeleton />;

  return (
    <section>
      <p className="eyebrow mb-2">{t("rewards.recentActivity")}</p>
      {transactions.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <Gift size={32} className="mx-auto text-text-light mb-3 opacity-40" />
          <p className="text-sm text-text-light">{t("rewards.noActivity")}</p>
        </div>
      ) : (
        <ul className="card-soft divide-y divide-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-text truncate">
                  {tx.reason ?? tx.type}
                </p>
                <p className="text-xs text-text-light mt-0.5">
                  {new Date(tx.createdAt).toLocaleDateString()}
                  {tx.status === "PENDING" ? ` · ${t("rewards.statePending")}` : ""}
                </p>
              </div>
              <span
                className={
                  tx.delta >= 0
                    ? "text-sm font-semibold text-secondary"
                    : "text-sm font-semibold text-danger"
                }
              >
                {tx.delta >= 0 ? "+" : ""}
                {tx.delta.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
