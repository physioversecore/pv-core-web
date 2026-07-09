import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";

export function Statistics() {
  const { t } = useLang();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardStat label={t("therapist_dashboard.sessionsThisWeek")} value="12" />
      <DashboardStat label={t("therapist_dashboard.totalPatients")} value="38" />
      <DashboardStat label={t("therapist_dashboard.earningsThisMonth")} value="Rs 42,500" />
      <DashboardStat label={t("therapist_dashboard.averageRating")} value="4.9 ★" />
    </div>
  );
}
