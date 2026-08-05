"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";


export default function Settings() {
  const { t } = useLang();
  const [msg, setMsg] = useState("");
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: true, marketing: false });


  return (
    <div>
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">

        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">{t("patient_dashboard.emergencyHotline")}</p>
            <div className="font-display text-2xl text-secondary">+977-1-555-0100</div>
            <p className="text-xs text-text-light mt-1">{t("patient_dashboard.urgentSupport")}</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success(t("patient_dashboard.messageSent")); setMsg(""); }} className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.contactSupport")}</p>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder={t("patient_dashboard.supportPlaceholder")} className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" />
            <button type="submit" className="btn-secondary w-full mt-3">{t("common.send")}</button>
          </form>
        </div>
        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.settingsNotificationPrefs")}</p>
            <Toggle label={t("patient_dashboard.settingsEmailNotif")} v={prefs.emailNotif} on={(v) => setPrefs({ ...prefs, emailNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsSmsReminders")} v={prefs.smsNotif} on={(v) => setPrefs({ ...prefs, smsNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsMarketing")} v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
            <button onClick={() => toast.success(t("common.savePreferences"))} className="btn-outline !py-1.5 !px-4 text-xs mt-2">{t("common.savePreferences")}</button>
          </div>
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">{t("patient_dashboard.settingsAccount")}</p>
            <button onClick={() => toast(t("therapist_dashboard.passwordResetSent"))} className="btn-outline w-full !py-2 text-sm mb-2">{t("patient_dashboard.settingsChangePassword")}</button>
            <button onClick={() => toast.error(t("patient_dashboard.settingsDeleteAccountConfirm"))} className="btn-primary w-full !py-2 text-sm mb-2">{t("patient_dashboard.settingsDeleteAccount")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => on(!v)} className={`w-10 h-6 rounded-full transition relative ${v ? "bg-secondary" : "bg-border"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${v ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}
