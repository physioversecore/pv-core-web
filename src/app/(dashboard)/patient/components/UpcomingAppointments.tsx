"use client";

import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useSessions } from "@/hooks/useSessions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatWhen, formatType } from "@/lib/format";

export function UpcomingAppointments() {
  const { t } = useLang();
  const { sessions, cancelSession, isCancelling } = useSessions();

  const upcoming = sessions.filter(
    (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS",
  );

  return (
    <div className="card-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">{t("patient_dashboard.upcomingSessions")}</h3>
        <span className="chip">{upcoming.length} {t("patient_dashboard.booked")}</span>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-text-light py-4">{t("patient_dashboard.noUpcomingSessions")}</p>
      ) : (
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
              {upcoming.map((u) => {
                const isPending = u.status === "IN_PROGRESS";
                return (
                  <tr key={u.id}>
                    <td className="py-3 pr-3 font-medium text-secondary">{u.therapistName || "Therapist"}</td>
                    <td className="py-3 pr-3 text-text-light">{formatWhen(u.date, u.time)}</td>
                    <td className="py-3 pr-3 text-text-light">{formatType(u.type)}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge
                        status={isPending ? "Pending" : "Confirmed"}
                        labels={{ confirmed: t("patient_dashboard.confirmed"), pending: t("patient_dashboard.pending") }}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          if (isPending) {
                            toast(t("patient_dashboard.cancel"));
                          } else {
                            cancelSession(u.id);
                          }
                        }}
                        disabled={isCancelling && !isPending}
                        className="btn-outline !py-1 !px-3 text-xs disabled:opacity-50"
                      >
                        {isPending ? t("patient_dashboard.cancel") : t("patient_dashboard.reschedule")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
