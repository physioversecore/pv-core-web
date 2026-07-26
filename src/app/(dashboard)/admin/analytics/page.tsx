"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Link from "next/link";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";

type DateRange = "this-month" | "last-3" | "last-6" | "custom";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("this-month");
  const { stats, zones, cancellation, revenue, isLoading, isRefetching, refetch } = useAdminAnalytics(dateRange);

  const exportReport = () => {
    toast.success("Report exported");
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="font-display text-xl">Analytics &amp; Reports</h2>
          <p className="text-sm text-text-light mt-1">
            The numbers behind the day-to-day — where to focus next.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
          <button onClick={exportReport} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
            <Download size={14} className="inline mr-1" /> Export report
          </button>
        </div>
      </div>

      <div className="tabs-filter mb-5">
        {([
          { value: "this-month", label: "This month" },
          { value: "last-3", label: "Last 3 months" },
          { value: "last-6", label: "Last 6 months" },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDateRange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
              dateRange === opt.value ? "tab-active" : "text-text-light hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <DashboardStat label="Revenue (MTD)" value={stats.revenueMTD} sub={`↑ ${stats.revenueChange} vs last month`} />
        <DashboardStat label="Cancellation rate" value={stats.cancellationRate} sub={`↑ ${stats.cancellationChange} vs last month`} variant="amber" />
        <DashboardStat label="Repeat booking rate" value={stats.repeatBookingRate} sub={`↑ ${stats.repeatChange} vs last month`} />
        <DashboardStat label="Avg session rating" value={stats.avgSessionRating} sub={stats.ratingNote} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <div className="card-soft p-5">
          <h3 className="font-display text-base mb-4">Bookings by zone (this month)</h3>
          {isLoading ? (
            <div className="h-[200px] bg-surface rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={zones} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="zone"
                  width={120}
                  tick={{ fontSize: 12, fill: "#4A5854" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  formatter={(value: number) => [`${value} bookings`, "Bookings"]}
                />
                <Bar dataKey="bookings" radius={[0, 6, 6, 0]} barSize={20}>
                  {zones.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isWarning ? "#C84B4B" : "#2F5D50"}
                      opacity={entry.isWarning ? 0.85 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-soft p-5">
          <h3 className="font-display text-base mb-4">Cancellation rate by therapist</h3>
          {isLoading ? (
            <div className="h-[200px] bg-surface rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cancellation} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="therapist"
                  width={120}
                  tick={{ fontSize: 12, fill: "#4A5854" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  formatter={(value: number) => [`${value}%`, "Cancellation rate"]}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={20}>
                  {cancellation.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isWarning ? "#C84B4B" : entry.isAmber ? "#E2962F" : "#2F5D50"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card-soft p-5">
        <h3 className="font-display text-base mb-4">Revenue trend — last 6 months</h3>
        {isLoading ? (
          <div className="h-[180px] bg-surface rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenue} margin={{ left: 10, right: 20 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#4A5854" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                formatter={(value: string) => [value, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#2F5D50" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
