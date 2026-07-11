"use client";

import { UploadReport } from "../components/UploadReport";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";

export default function ReportsUpload() {
  const { t } = useLang();

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      <UploadReport />
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
