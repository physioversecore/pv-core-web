"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useTherapists } from "@/hooks/useTherapists";
import { useTherapistSchedule } from "@/hooks/useTherapistSchedule";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";

interface Booking { id: string; patient: string; therapist: string; when: string; location: string; status: "Confirmed" | "Pending" | "Completed" | "Cancelled"; }
const SEED: Booking[] = [
  { id: "BK-1041", patient: "Sita Gurung", therapist: "Rajesh Shrestha", when: "23 Jun · 4:00 PM", location: "Baneshwor", status: "Confirmed" },
  { id: "BK-1040", patient: "Hari Bahadur Rai", therapist: "Rajesh Shrestha", when: "23 Jun · 1:00 PM", location: "Patan", status: "Confirmed" },
  { id: "BK-1039", patient: "Nabin Khadka", therapist: "Anita Tamang", when: "30 Jun · 10:00 AM", location: "Kalanki", status: "Pending" },
  { id: "BK-1038", patient: "Puja Maharjan", therapist: "Sujan Karki", when: "20 Jun · 2:00 PM", location: "Bhaktapur", status: "Completed" },
  { id: "BK-1037", patient: "Sita Gurung", therapist: "Rajesh Shrestha", when: "17 Jun · 4:00 PM", location: "Baneshwor", status: "Completed" },
];
const STATUSES = ["All statuses", "Confirmed", "Pending", "Completed", "Cancelled"] as const;

function getDateRangeForMonth(year: number, month: number) {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { start: fmt(monday), end: fmt(sunday) };
}

export default function AdminBookings() {
  const { t } = useLang();
  const { therapists, isRefetching: therapistsRefetching, refetch: refetchTherapists } = useTherapists();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "list">("schedule");

  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("All statuses");

  const weekRange = useMemo(() => getCurrentWeekRange(), []);
  const { appointments, workingHours, isLoading: scheduleLoading, isRefetching: scheduleRefetching, refetch: refetchSchedule } = useTherapistSchedule(
    selectedTherapistId,
    weekRange.start,
    weekRange.end,
  );

  const view = useMemo(() => rows.filter((r) =>
    (filter === "All statuses" || r.status === filter) &&
    [r.id, r.patient, r.therapist, r.location].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [rows, q, filter]);

  const selectedTherapistName = useMemo(() => {
    if (!selectedTherapistId) return null;
    return therapists.find((t) => t.id === selectedTherapistId)?.name ?? null;
  }, [selectedTherapistId, therapists]);

  const update = (id: string, status: Booking["status"], msg: string) => {
    setRows((r) => r.map((b) => b.id === id ? { ...b, status } : b));
    toast.success(msg);
  };

  return (
    <div className="space-y-4">
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">{t("admin_dashboard.allBookings")}</h3>
          <div className="flex items-center gap-2">
            <RefreshButton
              onRefresh={() => { refetchTherapists(); refetchSchedule(); }}
              isRefreshing={therapistsRefetching || scheduleRefetching}
            />
            <div className="flex items-center gap-1.5 bg-surface rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  activeTab === "schedule" ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
                }`}
              >
                {t("admin_dashboard.scheduleView")}
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  activeTab === "list" ? "bg-white text-secondary shadow-sm" : "text-text-light hover:text-text"
                }`}
              >
                {t("admin_dashboard.listView")}
              </button>
            </div>
          </div>
        </div>

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-light" />
                <label className="text-xs font-semibold text-text-light">
                  {t("admin_dashboard.selectTherapist")}
                </label>
              </div>
              {therapists.length === 0 ? (
                <div className="h-9 w-56 rounded-lg bg-surface animate-pulse" />
              ) : (
                <select
                  value={selectedTherapistId ?? ""}
                  onChange={(e) => setSelectedTherapistId(e.target.value || null)}
                  className="bg-white border border-border rounded-lg px-3 py-2 text-sm font-medium text-text cursor-pointer focus:outline-none focus:border-primary min-w-[220px]"
                >
                  <option value="">{t("admin_dashboard.selectTherapistPlaceholder")}</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name} — {therapist.specialty}
                    </option>
                  ))}
                </select>
              )}
              {selectedTherapistName && (
                <span className="text-xs text-text-light">
                  {t("admin_dashboard.viewingScheduleFor")} <span className="font-semibold text-text">{selectedTherapistName}</span>
                </span>
              )}
            </div>

            {selectedTherapistId ? (
              <ScheduleCalendar
                appointments={appointments}
                workingHours={workingHours}
                isLoading={scheduleLoading}
                isAdmin
                emptyMessage={t("admin_dashboard.noSessionsThisWeek")}
              />
            ) : (
              <div className="card-soft p-12 text-center">
                <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm font-semibold text-text">
                  {t("admin_dashboard.selectTherapistToView")}
                </p>
                <p className="text-xs text-text-light mt-1">
                  {t("admin_dashboard.selectTherapistHint")}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "list" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="px-3 py-2 rounded-full border border-border bg-background text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s === "All statuses" ? t("admin_dashboard.allStatuses") : s === "Confirmed" ? t("admin_dashboard.confirmed") : s === "Pending" ? t("admin_dashboard.pending") : s === "Completed" ? t("admin_dashboard.completed") : s === "Cancelled" ? t("admin_dashboard.cancelled") : s}</option>)}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin_dashboard.searchPlaceholder")} className="pl-9 pr-3 py-2 rounded-full border border-border bg-background text-sm w-44" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
                    <th className="py-2 pr-3">{t("admin_dashboard.bookingId")}</th><th className="py-2 pr-3">{t("admin_dashboard.patient")}</th><th className="py-2 pr-3">{t("admin_dashboard.therapist")}</th>
                    <th className="py-2 pr-3">{t("admin_dashboard.dateTime")}</th><th className="py-2 pr-3">{t("admin_dashboard.location")}</th><th className="py-2 pr-3">{t("admin_dashboard.status")}</th><th className="py-2">{t("admin_dashboard.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {view.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 pr-3 font-mono text-xs text-secondary">#{b.id}</td>
                      <td className="py-3 pr-3 font-medium">{b.patient}</td>
                      <td className="py-3 pr-3 text-text-light">{b.therapist}</td>
                      <td className="py-3 pr-3 text-text-light">{b.when}</td>
                      <td className="py-3 pr-3 text-text-light">{b.location}</td>
                      <td className="py-3 pr-3"><StatusChip status={b.status} /></td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          {b.status === "Pending" && (
                            <>
                              <button onClick={() => update(b.id, "Confirmed", t("admin_dashboard.bookingConfirmed"))} className="chip !bg-secondary/10 !text-secondary cursor-pointer">{t("admin_dashboard.confirm")}</button>
                              <button onClick={() => update(b.id, "Cancelled", t("admin_dashboard.bookingCancelled"))} className="chip !bg-destructive/10 !text-destructive cursor-pointer">{t("admin_dashboard.cancel")}</button>
                            </>
                          )}
                          {b.status === "Confirmed" && (
                            <>
                              <button onClick={() => toast(t("admin_dashboard.rescheduleSent"))} className="chip !bg-primary/15 !text-primary cursor-pointer">{t("admin_dashboard.reschedule")}</button>
                              <button onClick={() => update(b.id, "Cancelled", t("admin_dashboard.bookingCancelled"))} className="chip !bg-destructive/10 !text-destructive cursor-pointer">{t("admin_dashboard.cancel")}</button>
                            </>
                          )}
                          {(b.status === "Completed" || b.status === "Cancelled") && <span className="text-text-light text-xs">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: Booking["status"] }) {
  const { t } = useLang();
  const map = {
    Confirmed: "!bg-secondary/10 !text-secondary",
    Pending: "!bg-primary/15 !text-primary",
    Completed: "!bg-surface !text-secondary",
    Cancelled: "!bg-destructive/10 !text-destructive",
  } as const;
  const label: Record<string, string> = {
    Confirmed: t("admin_dashboard.confirmed"),
    Pending: t("admin_dashboard.pending"),
    Completed: t("admin_dashboard.completed"),
    Cancelled: t("admin_dashboard.cancelled"),
  };
  return <span className={`chip ${map[status]}`}>{label[status]}</span>;
}
