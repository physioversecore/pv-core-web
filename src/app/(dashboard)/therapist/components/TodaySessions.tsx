"use client";

import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useLang } from "@/context/i18n";

const TODAY: { time: string; patient: string; area: string; type: string; status: "Confirmed" | "Pending" }[] = [
  { time: "10:00 AM", patient: "Sita Gurung", area: "Baluwatar", type: "Home visit", status: "Confirmed" },
  { time: "1:30 PM", patient: "Hari Bahadur Rai", area: "Patan", type: "Home visit", status: "Confirmed" },
  { time: "4:00 PM", patient: "Nabin Khadka", area: "Maharajgunj", type: "Home visit", status: "Pending" },
];

export function TodaySessions() {
  const { t } = useLang();
  return (
    <section className="card-soft p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="eyebrow mb-1">{t("therapist_dashboard.today")}</p>
          <h3 className="font-display text-lg">{t("therapist_dashboard.upcomingToday")}</h3>
        </div>
        <span className="chip">{TODAY.length} {t("therapist_dashboard.visits")}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase font-mono text-text-light text-left border-b border-border">
              <th className="py-2 pr-3">{t("therapist_dashboard.time")}</th>
              <th className="py-2 pr-3">{t("therapist_dashboard.patient")}</th>
              <th className="py-2 pr-3">{t("therapist_dashboard.area")}</th>
              <th className="py-2 pr-3">{t("therapist_dashboard.type")}</th>
              <th className="py-2 pr-3">{t("therapist_dashboard.status")}</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TODAY.map((row) => (
              <tr key={row.time}>
                <td className="py-3 pr-3 font-mono text-secondary">{row.time}</td>
                <td className="py-3 pr-3 font-medium">{row.patient}</td>
                <td className="py-3 pr-3 text-text-light">{row.area}</td>
                <td className="py-3 pr-3 text-text-light">{row.type}</td>
                <td className="py-3 pr-3">
                  <StatusBadge status={row.status} labels={{ confirmed: t("therapist_dashboard.confirmed"), pending: t("therapist_dashboard.pending") }} />
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => toast.success(`${t("therapist_dashboard.start")} ${row.patient}`)}
                    className="btn-outline !py-1 !px-3 text-xs"
                  >
                    {t("therapist_dashboard.start")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
