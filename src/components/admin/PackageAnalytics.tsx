"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { npr } from "@/lib/format";
import type { AdminPackagePurchase } from "@/types";

interface PackageAnalyticsProps {
  purchases: AdminPackagePurchase[];
}

const COLORS = [
  "var(--color-secondary)",
  "var(--color-primary)",
  "var(--color-voltage-lime)",
  "#8B5CF6",
];

export function PackageAnalytics({ purchases }: PackageAnalyticsProps) {
  // Revenue by package
  const revenueByPackage = Object.values(
    purchases.reduce<Record<string, { name: string; revenue: number }>>((acc, p) => {
      if (!acc[p.packageName]) acc[p.packageName] = { name: p.packageName, revenue: 0 };
      acc[p.packageName].revenue += p.amount;
      return acc;
    }, {}),
  );

  // Sessions by package
  const sessionsByPackage = Object.values(
    purchases.reduce<Record<string, { name: string; used: number; total: number }>>((acc, p) => {
      if (!acc[p.packageName]) acc[p.packageName] = { name: p.packageName, used: 0, total: 0 };
      acc[p.packageName].used += p.sessionsUsed;
      acc[p.packageName].total += p.sessionsTotal;
      return acc;
    }, {}),
  );

  // Status distribution
  const statusCounts = purchases.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text mb-3">Revenue by Package</h3>
        <div className="card-soft p-4">
          {revenueByPackage.length === 0 ? (
            <p className="text-sm text-text-light py-8 text-center">No package sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByPackage} margin={{ left: 10, right: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-text-light)" }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-light)" }} width={60} />
                <Tooltip
                  formatter={(v: number | string) => npr(Number(v))}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {revenueByPackage.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Status Distribution</h3>
          <div className="card-soft p-4">
            {statusData.length === 0 ? (
              <p className="text-sm text-text-light py-8 text-center">No purchases yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    labelLine={false}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Sessions via Packages</h3>
          <div className="card-soft p-4 space-y-3">
            {sessionsByPackage.length === 0 ? (
              <p className="text-sm text-text-light py-8 text-center">No sessions yet.</p>
            ) : (
              sessionsByPackage.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-text">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    {s.name}
                  </span>
                  <span className="text-sm font-medium text-text-light">
                    {s.used} / {s.total} used
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
