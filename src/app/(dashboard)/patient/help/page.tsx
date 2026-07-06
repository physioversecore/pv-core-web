"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

const FAQ_KEYS = [
  { q: "patient_dashboard.helpQ1", a: "patient_dashboard.helpA1" },
  { q: "patient_dashboard.helpQ2", a: "patient_dashboard.helpA2" },
  { q: "patient_dashboard.helpQ3", a: "patient_dashboard.helpA3" },
  { q: "patient_dashboard.helpQ4", a: "patient_dashboard.helpA4" },
] as const;

export default function Help() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");

  return (
    <div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="card-soft p-5">
          <p className="eyebrow mb-3">{t("patient_dashboard.helpFaq")}</p>
          <div className="divide-y divide-border">
            {FAQ_KEYS.map((f, i) => (
              <div key={i} className="py-3">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center font-medium">
                  {t(f.q)}<span className="text-text-light">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && <p className="text-sm text-text-light mt-2">{t(f.a)}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">{t("patient_dashboard.emergencyHotline")}</p>
            <div className="font-display text-2xl text-secondary">+977-1-555-0100</div>
            <p className="text-xs text-text-light mt-1">{t("patient_dashboard.urgentSupport")}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success(t("patient_dashboard.messageSent")); setMsg(""); }} className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.contactSupport")}</p>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder={t("patient_dashboard.supportPlaceholder")} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" />
            <button type="submit" className="btn-pine w-full mt-3">{t("common.send")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
