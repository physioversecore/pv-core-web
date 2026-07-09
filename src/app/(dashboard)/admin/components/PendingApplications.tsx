"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { useLang } from "@/context/i18n";

interface PendingApp {
  id: string;
  name: string;
  date: string;
  city: string;
  license: boolean;
  cert: boolean;
}

export function PendingApplications() {
  const { t } = useLang();
  const [pending, setPending] = useState<PendingApp[]>([
    { id: "a1", name: "Dr. Pratap Joshi", date: "2026-06-26", city: "Pokhara", license: true, cert: true },
    { id: "a2", name: "Dr. Mina Karki", date: "2026-06-25", city: "Kathmandu", license: true, cert: false },
    { id: "a3", name: "Dr. Sushil Rana", date: "2026-06-24", city: "Lalitpur", license: true, cert: true },
  ]);

  const act = (id: string, ok: boolean) => {
    setPending((p) => p.filter((x) => x.id !== id));
    toast.success(ok ? t("admin_dashboard.therapistVerified") : t("admin_dashboard.applicationRejected"));
  };

  return (
    <div className="card-soft p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg">{t("admin_dashboard.pendingApplications")}</h3>
        <Link href="/admin/therapists" className="text-xs text-secondary hover:underline">
          {t("admin_dashboard.allTherapists")}
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-xs uppercase font-mono text-text-light text-left">
            <tr>
              <th className="p-2">{t("admin_dashboard.name")}</th>
              <th className="p-2">{t("admin_dashboard.applied")}</th>
              <th className="p-2">{t("admin_dashboard.city")}</th>
              <th className="p-2">{t("admin_dashboard.license")}</th>
              <th className="p-2">{t("admin_dashboard.certificate")}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pending.map((p) => (
              <tr key={p.id}>
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2 text-text-light">{p.date}</td>
                <td className="p-2 text-text-light">{p.city}</td>
                <td className="p-2">{p.license ? "✓" : "✗"}</td>
                <td className="p-2">{p.cert ? "✓" : "✗"}</td>
                <td className="p-2 flex gap-1 justify-end">
                  <button onClick={() => act(p.id, true)} className="btn-secondary !py-1 !px-3 text-xs">
                    {t("admin_dashboard.verify")}
                  </button>
                  <button onClick={() => act(p.id, false)} className="btn-outline !py-1 !px-3 text-xs">
                    {t("admin_dashboard.reject")}
                  </button>
                </td>
              </tr>
            ))}
            {pending.length === 0 && <EmptyTableRow colSpan={6} message={t("admin_dashboard.noPending")} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
