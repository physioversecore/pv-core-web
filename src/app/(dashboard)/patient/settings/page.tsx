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

const THERAPISTS = ["Rajesh Shrestha", "Anita Tamang", "Sunita Karki"];
const REASON_KEYS = [
  "patient_dashboard.settingsReasonUnprofessional",
  "patient_dashboard.settingsReasonLate",
  "patient_dashboard.settingsReasonIncorrect",
  "patient_dashboard.settingsReasonBilling",
  "patient_dashboard.settingsReasonOther",
] as const;

export default function Settings() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");
  const [c, setC] = useState<{ therapist: string; reason: string; details: string }>({ therapist: "", reason: REASON_KEYS[0], details: "" });
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: true, marketing: false });

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.therapist) return toast.error(t("patient_dashboard.settingsErrorSelectTherapist"));
    if (c.details.trim().length < 10) return toast.error(t("patient_dashboard.settingsErrorDescribe"));
    toast.success(t("patient_dashboard.settingsComplaintSent"));
    setC({ therapist: "", reason: REASON_KEYS[0], details: "" });
  };

  return (
    <div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          <form onSubmit={submitComplaint} className="card-soft p-5">
            <p className="eyebrow mb-1">{t("patient_dashboard.settingsFileComplaint")}</p>
            <h3 className="font-display text-lg mb-3">{t("patient_dashboard.settingsReportIssue")}</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-text-light">{t("patient_dashboard.therapist")}</label>
                <select value={c.therapist} onChange={(e) => setC({ ...c, therapist: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                  <option value="">{t("patient_dashboard.settingsSelectTherapist")}</option>
                  {THERAPISTS.map((th) => <option key={th}>{th}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-light">{t("patient_dashboard.settingsReason")}</label>
                <select value={c.reason} onChange={(e) => setC({ ...c, reason: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                  {REASON_KEYS.map((rk) => <option key={rk} value={rk}>{t(rk)}</option>)}
                </select>
              </div>
            </div>
            <label className="text-xs font-medium text-text-light">{t("patient_dashboard.settingsDescribe")}</label>
            <textarea value={c.details} onChange={(e) => setC({ ...c, details: e.target.value })} rows={4} maxLength={1000} placeholder={t("patient_dashboard.settingsDescribePlaceholder")} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm" />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-light">{t("patient_dashboard.settingsIdentityNote")}</span>
              <button type="submit" className="btn-pine !px-5">{t("common.send")}</button>
            </div>
          </form>

          <div className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.settingsNotificationPrefs")}</p>
            <Toggle label={t("patient_dashboard.settingsEmailNotif")} v={prefs.emailNotif} on={(v) => setPrefs({ ...prefs, emailNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsSmsReminders")} v={prefs.smsNotif} on={(v) => setPrefs({ ...prefs, smsNotif: v })} />
            <Toggle label={t("patient_dashboard.settingsMarketing")} v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
            <button onClick={() => toast.success(t("common.savePreferences"))} className="btn-outline !py-1.5 !px-4 text-xs mt-2">{t("common.savePreferences")}</button>
          </div>

          <div className="card-soft p-5">
            <p className="eyebrow mb-3">{t("patient_dashboard.settingsFaq")}</p>
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
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">{t("patient_dashboard.settingsAccount")}</p>
            <button onClick={() => toast(t("therapist_dashboard.passwordResetSent"))} className="btn-outline w-full !py-2 text-sm mb-2">{t("patient_dashboard.settingsChangePassword")}</button>
            <button onClick={() => toast.error(t("patient_dashboard.settingsDeleteAccountConfirm"))} className="w-full text-xs text-red-600 underline">{t("patient_dashboard.settingsDeleteAccount")}</button>
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
