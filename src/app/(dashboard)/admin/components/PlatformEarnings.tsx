"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RangeKey = "daily" | "weekly" | "monthly";

const RANGE_KEYS: RangeKey[] = ["daily", "weekly", "monthly"];

function PlatformEarningsSkeleton() {
  return (
    <div className="card-soft p-5">
      <Skeleton className="h-5 w-36 mb-3" />
      <Skeleton className="h-9 w-40 mb-1" />
      <Skeleton className="h-3 w-56 mb-4" />
      <Skeleton className="h-[180px] w-full rounded-xl" />
    </div>
  );
}

export function PlatformEarnings() {
  const { t } = useLang();
  const { earnings, earningsTrend, earningsLoading, earningsTrendLoading } = useAdminDashboard();
  const [range, setRange] = useState<RangeKey>("monthly");

  if (earningsLoading || earningsTrendLoading || !earnings || !earningsTrend) {
    return <PlatformEarningsSkeleton />;
  }

  const formatted = `Rs ${earnings.platformEarnings.toLocaleString()}`;
  const data = earningsTrend[range] ?? [];

  const rangeLabels: Record<RangeKey, string> = {
    daily: t("admin_dashboard.daily"),
    weekly: t("admin_dashboard.weekly"),
    monthly: t("admin_dashboard.monthly"),
  };

  return (
    <div className="card-soft p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-lg mb-1">{t("admin_dashboard.platformEarnings")}</h3>
          <div className="text-3xl font-display text-secondary">{formatted}</div>
        </div>
      </div>
      <p className="text-xs text-text-light mt-1">
        {earnings.description || t("admin_dashboard.platformFeeDesc")}
      </p>

      <div className="tabs-filter mt-4 mb-3">
        {RANGE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              range === key ? "tab-active" : "text-text-light hover:text-text"
            }`}
          >
            {rangeLabels[key]}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-sm text-text-light">
          {t("admin_dashboard.noEarningsYet")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="platformEarningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-text-light)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: "var(--color-primary)", strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-card)",
                boxShadow: "none",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-text-muted)" }}
              formatter={(value) => [
                `Rs ${Number(value).toLocaleString()}`,
                t("admin_dashboard.platformEarnings"),
              ]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              fill="url(#platformEarningsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
