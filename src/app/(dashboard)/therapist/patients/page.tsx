"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";

const PATIENTS = [
  { id: "p1", name: "Ramesh Adhikari", condition: "ACL post-op", sessions: 8, last: "2026-06-20", rating: 5 },
  { id: "p2", name: "Sita Lama", condition: "Lower back pain", sessions: 4, last: "2026-06-22", rating: 4.5 },
  { id: "p3", name: "Hari Pradhan", condition: "Post-stroke rehab", sessions: 12, last: "2026-06-18", rating: 5 },
  { id: "p4", name: "Anita Sharma", condition: "Frozen shoulder", sessions: 3, last: "2026-06-15", rating: 4 },
];

export default function Patients() {
  const { t } = useLang();
  const [selected, setSelected] = useState<typeof PATIENTS[number] | null>(null);
  return (
    <>
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left bg-surface/60 text-xs uppercase tracking-wider font-mono text-text-light">
            <tr>
              <th className="p-3">{t("therapist_dashboard.patientLabel")}</th><th className="p-3">{t("therapist_dashboard.condition")}</th><th className="p-3">{t("therapist_dashboard.sessions")}</th><th className="p-3">{t("therapist_dashboard.lastVisit")}</th><th className="p-3">{t("therapist_dashboard.rating")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PATIENTS.map((p) => (
              <tr key={p.id} className="hover:bg-surface/40 cursor-pointer" onClick={() => setSelected(p)}>
                <td className="p-3 flex items-center gap-2"><Avatar name={p.name} size={32} /><span className="font-medium">{p.name}</span></td>
                <td className="p-3 text-text-light">{p.condition}</td>
                <td className="p-3">{p.sessions}</td>
                <td className="p-3 text-text-light">{p.last}</td>
                <td className="p-3">{p.rating} ★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end p-0 sm:p-6">
          <button className="absolute inset-0 bg-text/50" onClick={() => setSelected(null)} />
          <div className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={selected.name} size={52} />
              <div><div className="font-display text-xl">{selected.name}</div><div className="text-xs text-text-light">{selected.condition}</div></div>
            </div>
            <Row label={t("therapist_dashboard.totalSessions")} value={String(selected.sessions)} />
            <Row label={t("therapist_dashboard.lastVisit")} value={selected.last} />
            <Row label={t("therapist_dashboard.ratingGiven")} value={`${selected.rating} ★`} />
            <button onClick={() => setSelected(null)} className="btn-outline w-full mt-5">{t("common.close")}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-2 border-b border-border text-sm"><span className="text-text-light">{label}</span><span className="font-medium">{value}</span></div>;
}
