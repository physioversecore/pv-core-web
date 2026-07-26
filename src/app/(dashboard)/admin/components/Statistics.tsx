"use client";

import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

function StatisticsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-soft p-5 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function Statistics() {
  const { t } = useLang();
  const { stats, statsLoading } = useAdminDashboard();

  if (statsLoading || !stats) return <StatisticsSkeleton />;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardStat label={t("admin_dashboard.totalTherapists")} value={String(stats.totalTherapists)} />
      <DashboardStat label={t("admin_dashboard.totalPatients")} value={stats.totalPatients.toLocaleString()} />
      <DashboardStat label={t("admin_dashboard.sessionsThisWeek")} value={String(stats.sessionsThisWeek)} />
      <DashboardStat
        label={t("admin_dashboard.pendingVerifications")}
        value={String(stats.pendingVerifications)}
        variant="amber"
      />
    </div>
  );
}
