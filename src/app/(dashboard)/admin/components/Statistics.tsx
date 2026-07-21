"use client";

import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export function Statistics() {
  const { t } = useLang();
  const { stats } = useAdminDashboard();

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardStat label={t("admin_dashboard.totalTherapists")} value={String(stats.totalTherapists)} />
      <DashboardStat label={t("admin_dashboard.totalPatients")} value={stats.totalPatients.toLocaleString()} />
      <DashboardStat label={t("admin_dashboard.sessionsThisWeek")} value={String(stats.sessionsThisWeek)} />
      <DashboardStat label={t("admin_dashboard.pendingVerifications")} value={String(stats.pendingVerifications)} variant="amber" />
    </div>
  );
}
