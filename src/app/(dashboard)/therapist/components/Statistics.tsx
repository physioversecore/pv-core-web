import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";
import { StatsSkeleton } from "@/components/SuspenseFallback";
import { npr } from "@/lib/format";

export function Statistics() {
  const { t } = useLang();
  const { dashboard, isLoading } = useTherapistDashboard();

  if (isLoading) return <StatsSkeleton />;

  const sessionsWeek = dashboard?.sessionsThisWeek ?? 0;
  const totalPatients = dashboard?.totalPatients ?? 0;
  const earnings = dashboard?.earningsThisMonth ?? 0;
  const rating = dashboard?.averageRating ?? 0;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardStat label={t("therapist_dashboard.sessionsThisWeek")} value={String(sessionsWeek)} />
      <DashboardStat label={t("therapist_dashboard.totalPatients")} value={String(totalPatients)} />
      <DashboardStat label={t("therapist_dashboard.earningsThisMonth")} value={npr(earnings)} />
      <DashboardStat label={t("therapist_dashboard.averageRating")} value={`${rating.toFixed(1)} ★`} />
    </div>
  );
}
