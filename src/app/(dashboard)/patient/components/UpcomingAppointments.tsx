"use client";

import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useLang } from "@/context/i18n";

interface UpRow {
  id: string;
  therapist: string;
  when: string;
  type: string;
  status: "Confirmed" | "Pending";
}

const UPCOMING: UpRow[] = [
  { id: "u1", therapist: "Rajesh Shrestha", when: "Today · 4:00 PM", type: "Home visit", status: "Confirmed" },
  { id: "u2", therapist: "Rajesh Shrestha", when: "Fri 27 Jun · 4:00 PM", type: "Home visit", status: "Confirmed" },
  { id: "u3", therapist: "Anita Tamang", when: "Mon 30 Jun · 10:00 AM", type: "Home visit", status: "Pending" },
];

export function UpcomingAppointments() {
  const { t } = useLang();
  return (
    <div className="card-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">{t("patient_dashboard.upcomingSessions")}</h3>
        <span className="chip">{UPCOMING.length} {t("patient_dashboard.booked")}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase font-mono text-text-light text-left border-b border-border">
              <th className="py-2 pr-3">{t("patient_dashboard.therapist")}</th>
              <th className="py-2 pr-3">{t("patient_dashboard.dateTime")}</th>
              <th className="py-2 pr-3">{t("patient_dashboard.type")}</th>
              <th className="py-2 pr-3">{t("patient_dashboard.status")}</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {UPCOMING.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-3 font-medium text-secondary">{u.therapist}</td>
                <td className="py-3 pr-3 text-text-light">{u.when}</td>
                <td className="py-3 pr-3 text-text-light">{u.type}</td>
                <td className="py-3 pr-3">
                  <StatusBadge status={u.status} labels={{ confirmed: t("patient_dashboard.confirmed"), pending: t("patient_dashboard.pending") }} />
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => toast(u.status === "Pending" ? t("patient_dashboard.cancel") : t("patient_dashboard.rescheduleSent"))}
                    className="btn-outline !py-1 !px-3 text-xs"
                  >
                    {u.status === "Pending" ? t("patient_dashboard.cancel") : t("patient_dashboard.reschedule")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
