"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { DatePicker } from "@/components/ui/date-picker";

const REASONS = ["Sickness", "Family emergency", "Personal", "Travel", "Other"];

export default function TSettings() {
  const { t } = useLang();
  const [off, setOff] = useState({ from: "", to: "", reason: REASONS[0], note: "" });
  const [rate, setRate] = useState({ current: 1200, requested: 1400, reason: "" });
  const [prefs, setPrefs] = useState({ smsAlerts: true, newBookings: true, marketing: false });

  const submitOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!off.from || !off.to) return toast.error(t("therapist_dashboard.errorPickFromTo"));
    toast.success(t("therapist_dashboard.dayOffSubmitted"));
    setOff({ from: "", to: "", reason: REASONS[0], note: "" });
  };

  const submitRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (rate.requested <= rate.current) return toast.error(t("therapist_dashboard.errorRateHigher"));
    if (rate.reason.trim().length < 10) return toast.error(t("therapist_dashboard.errorJustification"));
    toast.success(t("therapist_dashboard.rateChangeSent"));
    setRate({ ...rate, reason: "" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="card-soft p-5">
        <p className="eyebrow mb-1">{t("therapist_dashboard.settingsProfile")}</p>
        <h3 className="font-display text-lg mb-2">{t("therapist_dashboard.settingsEditProfile")}</h3>
        <p className="text-sm text-text-light mb-3">{t("therapist_dashboard.settingsProfileDesc")}</p>
        <Link href="/therapist/profile" className="btn-secondary !px-5 inline-block">{t("therapist_dashboard.openProfileEditor")}</Link>
      </div>

      <form onSubmit={submitOff} className="card-soft p-5">
        <p className="eyebrow mb-1">{t("therapist_dashboard.emergencyDayOff")}</p>
        <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.applyTimeOff")}</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.from")}</label>
            <DatePicker value={off.from} onChange={(v) => setOff({ ...off, from: v })} min={new Date().toISOString().slice(0, 10)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.to")}</label>
            <DatePicker value={off.to} onChange={(v) => setOff({ ...off, to: v })} min={new Date().toISOString().slice(0, 10)} className="mt-1" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.reason")}</label>
          <select value={off.reason} onChange={(e) => setOff({ ...off, reason: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm">
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.noteForAdmin")}</label>
        <textarea value={off.note} onChange={(e) => setOff({ ...off, note: e.target.value })} rows={3} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
        <button type="submit" className="btn-secondary w-full">{t("common.submit")}</button>
        <p className="text-xs text-text-light mt-2">{t("therapist_dashboard.affectedBookingsNote")}</p>
      </form>

      <form onSubmit={submitRate} className="card-soft p-5 lg:col-span-2">
        <p className="eyebrow mb-1">{t("therapist_dashboard.sessionRateChange")}</p>
        <h3 className="font-display text-lg mb-3">{t("therapist_dashboard.requestNewRate")}</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.currentRate")}</label>
            <input type="number" value={rate.current} disabled className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-surface/40 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.requestedRate")}</label>
            <input type="number" value={rate.requested} onChange={(e) => setRate({ ...rate, requested: +e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.increase")}</label>
            <div className="mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium text-secondary">
              +Rs {Math.max(0, rate.requested - rate.current)} ({rate.current > 0 ? Math.round(((rate.requested - rate.current) / rate.current) * 100) : 0}%)
            </div>
          </div>
        </div>
        <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.justification")}</label>
        <textarea value={rate.reason} onChange={(e) => setRate({ ...rate, reason: e.target.value })} rows={3} placeholder={t("therapist_dashboard.justificationPlaceholder")} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
        <button type="submit" className="btn-secondary !px-6">{t("therapist_dashboard.submitRateChange")}</button>
        <p className="text-xs text-text-light mt-2">{t("therapist_dashboard.rateChangeNote")}</p>
      </form>

      <div className="card-soft p-5">
        <p className="eyebrow mb-3">{t("therapist_dashboard.notificationPreferences")}</p>
        <Toggle label={t("therapist_dashboard.smsAlerts")} v={prefs.smsAlerts} on={(v) => setPrefs({ ...prefs, smsAlerts: v })} />
        <Toggle label={t("therapist_dashboard.dailyScheduleDigest")} v={prefs.newBookings} on={(v) => setPrefs({ ...prefs, newBookings: v })} />
        <Toggle label={t("therapist_dashboard.platformAnnouncements")} v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
        <button onClick={() => toast.success(t("common.savePreferences"))} className="btn-outline !py-1.5 !px-4 text-xs mt-2">{t("common.savePreferences")}</button>
      </div>

      <div className="card-soft p-5">
        <p className="eyebrow mb-2">{t("therapist_dashboard.account")}</p>
        <button onClick={() => toast(t("therapist_dashboard.passwordResetSent"))} className="btn-outline w-full !py-2 text-sm mb-2">{t("therapist_dashboard.changePassword")}</button>
        <button onClick={() => toast(t("therapist_dashboard.loggedOutDevices"))} className="btn-outline w-full !py-2 text-sm">{t("therapist_dashboard.logOutAllDevices")}</button>
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
