"use client";

import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";

export function Statistics() {
  const { t } = useLang();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardStat label={t("admin_dashboard.totalTherapists")} value="184" />
      <DashboardStat label={t("admin_dashboard.totalPatients")} value="1,247" />
      <DashboardStat label={t("admin_dashboard.sessionsThisWeek")} value="312" />
      <DashboardStat label={t("admin_dashboard.pendingVerifications")} value="3" variant="amber" />
    </div>
  );
}
