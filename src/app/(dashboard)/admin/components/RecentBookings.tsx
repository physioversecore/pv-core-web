"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";

const statusColor: Record<string, string> = {
  Confirmed: "badge-success",
  Cancelled: "badge-danger",
  Rescheduled: "badge-warning",
};

export function RecentBookings() {
  const { t } = useLang();
  const { recentBookings } = useAdminDashboard();

  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">{t("admin_dashboard.recentBookings")}</h3>
        <Link
          href="/admin/bookings"
          className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1.5"
        >
          <Calendar size={13} />
          {t("admin_dashboard.viewAll" as any) ?? "View All"}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-xs uppercase font-mono text-text-light text-left">
            <tr>
              <th className="p-2">{t("admin_dashboard.patient") ?? "Patient"}</th>
              <th className="p-2">{t("admin_dashboard.therapist") ?? "Therapist"}</th>
              <th className="p-2">{t("admin_dashboard.date") ?? "Date"}</th>
              <th className="p-2">{t("admin_dashboard.sessionType") ?? "Type"}</th>
              <th className="p-2">{t("admin_dashboard.status") ?? "Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentBookings.map((b) => (
              <tr key={b.id} className="hover:bg-surface/60 transition-colors">
                <td className="p-2 font-medium">{b.patient}</td>
                <td className="p-2 text-text-light">{b.therapist}</td>
                <td className="p-2 text-text-light font-mono text-xs">{b.date}</td>
                <td className="p-2 text-text-light">{b.sessionType}</td>
                <td className="p-2">
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${statusColor[b.status] ?? "bg-surface text-text-light"}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentBookings.length === 0 && (
              <EmptyTableRow colSpan={5} message={t("admin_dashboard.noRecentBookings" as any) ?? "No recent bookings"} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
