"use client";

import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export function RecentBookings() {
  const { t } = useLang();
  const { activity } = useAdminDashboard();

  const typeLabel: Record<string, string> = {
    booked: "booked",
    rescheduled: "rebooked",
    cancelled: "cancelled",
    completed: "completed",
  };

  return (
    <div className="card-soft p-5">
      <h3 className="font-display text-lg mb-3">{t("admin_dashboard.recentBookings")}</h3>
      <ul className="text-sm space-y-2 text-text-light">
        {activity.map((a) => (
          <li key={a.id}>
            {a.patientName} {typeLabel[a.type] ?? a.type} {a.therapistName} — {a.timeAgo}
          </li>
        ))}
        {activity.length === 0 && <li className="text-text-muted">No recent activity</li>}
      </ul>
    </div>
  );
}
