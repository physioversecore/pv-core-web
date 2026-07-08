"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/services/api/sessions";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

export default function ReportsUpload() {
  const { t } = useLang();
  const [form, setForm] = useState({ patient: "", date: "", notes: "", exercises: "", file: "" });

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => getSessions(),
  });

  const patientNames = [...new Set((sessionsData?.sessions ?? []).map((s) => s.patientId))];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient || !form.date) return toast.error(t("therapist_dashboard.errorPickPatient"));
    toast.success(t("therapist_dashboard.reportUploaded"));
    setForm({ patient: "", date: "", notes: "", exercises: "", file: "" });
  };

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <form onSubmit={submit} className="card-soft p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reportsPatient")}</label>
          <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            <option value="">{t("therapist_dashboard.selectPatient")}</option>
            {patientNames.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reportsSessionDate")}</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reportsNotes")}</label>
          <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reportsExercises")}</label>
          <textarea rows={3} value={form.exercises} onChange={(e) => setForm({ ...form, exercises: e.target.value })} placeholder={t("therapist_dashboard.reportsExercisesPlaceholder")} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
        </div>
        <button type="button" onClick={() => setForm({ ...form, file: "report.pdf" })} className={`w-full p-4 rounded-xl border-2 border-dashed text-sm ${form.file ? "border-secondary bg-surface text-secondary" : "border-border text-text-light hover:border-secondary"}`}>
          {form.file ? `✓ ${form.file} ${t("therapist_dashboard.reportsReady")}` : t("therapist_dashboard.reportsDragDrop")}
        </button>
        <button type="submit" className="btn-secondary w-full">{t("therapist_dashboard.uploadNotify")}</button>
      </form>

      <RecentReports />
    </div>
  );
}

interface Recent { id: string; patient: string; title: string; file: string; date: string; size: string }
const RECENT_REPORTS: Recent[] = [
  { id: "r1", patient: "Sita Gurung", title: "Progress report — week 4", file: "sita-week4.pdf", date: "28 Jun", size: "412 KB" },
  { id: "r2", patient: "Hari Bahadur Rai", title: "Session note", file: "hari-25jun.pdf", date: "25 Jun", size: "188 KB" },
  { id: "r3", patient: "Nabin Khadka", title: "Exercise plan", file: "nabin-exercises.pdf", date: "22 Jun", size: "256 KB" },
  { id: "r4", patient: "Puja Maharjan", title: "X-ray report", file: "puja-xray.pdf", date: "18 Jun", size: "1.2 MB" },
];

function RecentReports() {
  const { t } = useLang();
  return (
    <section className="card-soft p-5 h-fit">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="eyebrow mb-1">{t("therapist_dashboard.reportsRecent")}</p>
          <h3 className="font-display text-lg">{t("therapist_dashboard.reportsPatientReports")}</h3>
        </div>
        <span className="chip">{RECENT_REPORTS.length}</span>
      </div>
      <div className="divide-y divide-border">
        {RECENT_REPORTS.map((r) => (
          <div key={r.id} className="py-3 flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary grid place-items-center text-xs font-mono shrink-0">PDF</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{r.patient}</div>
              <div className="text-xs text-text-light truncate">{r.title} · <span className="font-mono">{r.file}</span></div>
              <div className="text-xs text-text-light mt-0.5 font-mono">{r.date} · {r.size}</div>
            </div>
            <button onClick={() => toast(`${t("therapist_dashboard.reportsView")} ${r.file}`)} className="btn-outline !py-1 !px-3 text-xs">{t("therapist_dashboard.reportsView")}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
