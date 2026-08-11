"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/i18n";
import { useSessions } from "@/hooks/useSessions";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CancelConfirmModal } from "@/components/modals/CancelConfirmModal";
import { RescheduleModal } from "@/components/modals/RescheduleModal";
import { formatWhen, formatType, isPast } from "@/lib/format";
import type { SessionData } from "@/services/api/sessions";

const OVERVIEW_LIMIT = 5;

export function UpcomingAppointments() {
  const { t } = useLang();
  const { sessions, cancelSession, isCancelling, rescheduleSession, isRescheduling } = useSessions();
  const [cancelTarget, setCancelTarget] = useState<SessionData | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<SessionData | null>(null);

  const allUpcoming = sessions.filter(
    (s) =>
      (s.status === "SCHEDULED" || s.status === "IN_PROGRESS") &&
      !isPast(s.date, s.time),
  );
  const showViewAll = allUpcoming.length > OVERVIEW_LIMIT;
  const upcoming = showViewAll ? allUpcoming.slice(0, OVERVIEW_LIMIT) : allUpcoming;

  const handleCancelConfirm = (reason?: string) => {
    if (!cancelTarget) return;
    cancelSession({ id: cancelTarget.id, reason });
    setCancelTarget(null);
  };

  const handleRescheduleConfirm = (newDate: string, newTime: string) => {
    if (!rescheduleTarget) return;
    rescheduleSession(
      { id: rescheduleTarget.id, newDate, newTime },
      { onSuccess: () => setRescheduleTarget(null) },
    );
  };

  return (
    <>
      <div className="card-soft p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg">{t("patient_dashboard.upcomingSessions")}</h3>
          <span className="chip">{allUpcoming.length} {t("patient_dashboard.booked")}</span>
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
                {upcoming.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-3 font-medium text-secondary">{u.therapistName || "Therapist"}</td>
                    <td className="py-3 pr-3 text-text-light">{formatWhen(u.date, u.time)}</td>
                    <td className="py-3 pr-3 text-text-light">{formatType(u.type)}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge
                        status={u.status === "IN_PROGRESS" ? "Pending" : "Confirmed"}
                        labels={{ confirmed: t("patient_dashboard.confirmed"), pending: t("patient_dashboard.pending") }}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRescheduleTarget(u)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-primary text-primary text-[11px] font-semibold cursor-pointer hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                        >
                          {t("patient_dashboard.reschedule")}
                        </button>
                        <button
                          onClick={() => setCancelTarget(u)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-danger text-danger text-[11px] font-semibold cursor-pointer hover:bg-danger hover:text-white transition-all whitespace-nowrap"
                        >
                          {t("patient_dashboard.cancelSession")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showViewAll && (
          <div className="mt-3 text-center">
            <Link
              href="/patient/sessions"
              className="text-sm font-medium text-secondary hover:underline"
            >
              {t("patient_dashboard.viewAll")} →
            </Link>
          </div>
        )}
      </div>

      {cancelTarget && (
        <CancelConfirmModal
          therapistName={cancelTarget.therapistName || "Therapist"}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          isPending={isCancelling}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          therapistId={rescheduleTarget.therapistId}
          therapistName={rescheduleTarget.therapistName || "Therapist"}
          sessionId={rescheduleTarget.id}
          currentDate={rescheduleTarget.date}
          currentTime={rescheduleTarget.time}
          onConfirm={handleRescheduleConfirm}
          onClose={() => setRescheduleTarget(null)}
          isPending={isRescheduling}
        />
      )}
    </>
  );
}
