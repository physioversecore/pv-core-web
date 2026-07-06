"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const PATIENTS = [
  { id: "u1", name: "Sita Gurung", city: "Lalitpur", sessions: 12, therapist: "Rajesh Shrestha", joined: "Jan 2026" },
  { id: "u2", name: "Hari Bahadur Rai", city: "Kathmandu", sessions: 7, therapist: "Rajesh Shrestha", joined: "Mar 2026" },
  { id: "u3", name: "Nabin Khadka", city: "Kathmandu", sessions: 2, therapist: "Anita Tamang", joined: "Jun 2026" },
  { id: "u4", name: "Puja Maharjan", city: "Bhaktapur", sessions: 5, therapist: "Sujan Karki", joined: "Apr 2026" },
];

export default function AdminPatients() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const rows = useMemo(() => PATIENTS.filter((p) => [p.name, p.city, p.therapist].join(" ").toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">{t("admin_dashboard.allPatients")}</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin_dashboard.searchPatient")} className="pl-9 pr-3 py-2 rounded-full border border-border bg-background text-sm w-56" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
                <th className="py-2 pr-3">{t("admin_dashboard.name")}</th><th className="py-2 pr-3">{t("admin_dashboard.city")}</th><th className="py-2 pr-3">{t("admin_dashboard.sessions")}</th>
                <th className="py-2 pr-3">{t("admin_dashboard.therapist")}</th><th className="py-2 pr-3">{t("admin_dashboard.joined")}</th><th className="py-2">{t("admin_dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.name} size={28} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-text-light">{p.city}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{p.sessions}</td>
                  <td className="py-3 pr-3 text-text-light">{p.therapist}</td>
                  <td className="py-3 pr-3 text-text-light">{p.joined}</td>
                  <td className="py-3 flex gap-1.5">
                    <button onClick={() => toast(t("admin_dashboard.viewProfile"))} className="chip !bg-secondary/10 !text-secondary cursor-pointer">{t("admin_dashboard.viewProfile")}</button>
                    <button onClick={() => toast(t("admin_dashboard.rescheduleSent"))} className="chip !bg-primary/15 !text-primary cursor-pointer">{t("admin_dashboard.reschedule")}</button>
                    <button onClick={() => toast.error(t("admin_dashboard.patientDeactivated"))} className="btn-outline !py-1 !px-3 text-xs">{t("admin_dashboard.deactivate")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
