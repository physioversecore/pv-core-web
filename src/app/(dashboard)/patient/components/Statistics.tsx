import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";

export function Statistics() {
  const { t } = useLang();
  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      <DashboardStat
        label={t("patient_dashboard.totalSessions")}
        value="12"
        sub={t("patient_dashboard.remainingPackage")}
      />
      <DashboardStat
        label={t("patient_dashboard.nextSession")}
        value="Today, 4:00 PM"
        sub="Rajesh Shrestha · Home visit"
      />
      <DashboardStat
        label={t("patient_dashboard.recoveryProgress")}
        value="62%"
        sub={`Knee rehab · 5 of 8 ${t("patient_dashboard.sessionsDone")}`}
      />
    </div>
  );
}
