import { DashboardStat } from "@/components/dashboard/DashboardStat";
import { useLang } from "@/context/i18n";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { StatsSkeleton } from "@/components/SuspenseFallback";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function Statistics() {
  const { t } = useLang();
  const { dashboard, isLoading } = usePatientDashboard();

  if (isLoading) return <StatsSkeleton />;

  const total = dashboard?.totalSessions ?? 0;
  const completed = dashboard?.completedSessions ?? 0;
  const nextSession = dashboard?.nextSession ?? null;

  const nextValue = nextSession
    ? `${formatTime(nextSession.time)}, ${formatDate(nextSession.date)}`
    : "—";

  const nextLabel = nextSession
    ? `${nextSession.therapistName} · ${nextSession.type.replace("_", " ").toLowerCase()}`
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
