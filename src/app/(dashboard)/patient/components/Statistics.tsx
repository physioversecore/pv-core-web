import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { StatsSkeleton } from "@/components/SuspenseFallback";
import { formatWhen, formatType } from "@/lib/format";

export function Statistics() {
  const { t } = useLang();
  const { dashboard, isLoading } = usePatientDashboard();

  if (isLoading) return <StatsSkeleton />;

  const total = dashboard?.totalSessions ?? 0;
  const completed = dashboard?.completedSessions ?? 0;
  const nextSession = dashboard?.nextSession ?? null;

  const nextValue = nextSession
    ? formatWhen(nextSession.date, nextSession.time)
    : "—";

  const nextLabel = nextSession
    ? `${nextSession.therapistName} · ${formatType(nextSession.type)}`
    : t("patient_dashboard.noUpcoming");

  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressSub = `${completed} of ${total} ${t("patient_dashboard.sessionsDone")}`;

  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      <DashboardStat
        label={t("patient_dashboard.totalSessions")}
        value={String(total)}
        sub={`${completed} completed`}
      />
      <DashboardStat
        label={t("patient_dashboard.nextSession")}
        value={nextValue}
        sub={nextLabel}
      />
      <DashboardStat
        label={t("patient_dashboard.recoveryProgress")}
        value={`${progressPct}%`}
        sub={progressSub}
      />
    </div>
  );
}
