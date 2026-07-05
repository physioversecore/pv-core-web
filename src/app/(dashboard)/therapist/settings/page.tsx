"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const REASONS = ["Sickness", "Family emergency", "Personal", "Travel", "Other"];

export default function TSettings() {
  const [off, setOff] = useState({ from: "", to: "", reason: REASONS[0], note: "" });
  const [rate, setRate] = useState({ current: 1200, requested: 1400, reason: "" });
  const [prefs, setPrefs] = useState({ smsAlerts: true, newBookings: true, marketing: false });

  const submitOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!off.from || !off.to) return toast.error("Pick from & to dates");
    toast.success("Day-off application submitted to admin");
    setOff({ from: "", to: "", reason: REASONS[0], note: "" });
  };

  const submitRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (rate.requested <= rate.current) return toast.error("Requested rate must be higher than current");
    if (rate.reason.trim().length < 10) return toast.error("Add a short justification (10+ chars)");
    toast.success("Rate change application sent for admin approval");
    setRate({ ...rate, reason: "" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="card-soft p-5">
        <p className="eyebrow mb-1">Profile</p>
        <h3 className="font-display text-lg mb-2">Edit your public profile</h3>
        <p className="text-sm text-text-light mb-3">Update your bio, photo, specialty, experience, fee, and availability.</p>
        <Link href="/therapist/profile" className="btn-pine !px-5 inline-block">Open profile editor</Link>
      </div>

      <form onSubmit={submitOff} className="card-soft p-5">
        <p className="eyebrow mb-1">Emergency day off</p>
        <h3 className="font-display text-lg mb-3">Apply for time off</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">From</label>
            <input type="date" value={off.from} onChange={(e) => setOff({ ...off, from: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">To</label>
            <input type="date" value={off.to} onChange={(e) => setOff({ ...off, to: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-medium text-text-light">Reason</label>
          <select value={off.reason} onChange={(e) => setOff({ ...off, reason: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm">
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <label className="text-xs font-medium text-text-light">Note for admin</label>
        <textarea value={off.note} onChange={(e) => setOff({ ...off, note: e.target.value })} rows={3} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
        <button type="submit" className="btn-pine w-full">Submit application</button>
        <p className="text-xs text-text-light mt-2">Affected bookings will be flagged for rescheduling.</p>
      </form>

      <form onSubmit={submitRate} className="card-soft p-5 lg:col-span-2">
        <p className="eyebrow mb-1">Session rate change</p>
        <h3 className="font-display text-lg mb-3">Request a new per-session rate</h3>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-text-light">Current rate (NPR)</label>
            <input type="number" value={rate.current} disabled className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-surface/40 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">Requested rate (NPR)</label>
            <input type="number" value={rate.requested} onChange={(e) => setRate({ ...rate, requested: +e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-light">Increase</label>
            <div className="mt-1 px-3 py-2 rounded-xl border border-border bg-white text-sm font-medium text-secondary">
              +Rs {Math.max(0, rate.requested - rate.current)} ({rate.current > 0 ? Math.round(((rate.requested - rate.current) / rate.current) * 100) : 0}%)
            </div>
          </div>
        </div>
        <label className="text-xs font-medium text-text-light">Justification</label>
        <textarea value={rate.reason} onChange={(e) => setRate({ ...rate, reason: e.target.value })} rows={3} placeholder="New certification, added years of experience, expanded service area…" className="w-full mt-1 mb-3 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
        <button type="submit" className="btn-pine !px-6">Submit rate change application</button>
        <p className="text-xs text-text-light mt-2">Admin reviews rate change requests within 3–5 business days.</p>
      </form>

      <div className="card-soft p-5">
        <p className="eyebrow mb-3">Notification preferences</p>
        <Toggle label="SMS alerts for new bookings" v={prefs.smsAlerts} on={(v) => setPrefs({ ...prefs, smsAlerts: v })} />
        <Toggle label="Daily schedule digest" v={prefs.newBookings} on={(v) => setPrefs({ ...prefs, newBookings: v })} />
        <Toggle label="Platform announcements" v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
        <button onClick={() => toast.success("Preferences saved")} className="btn-outline !py-1.5 !px-4 text-xs mt-2">Save preferences</button>
      </div>

      <div className="card-soft p-5">
        <p className="eyebrow mb-2">Account</p>
        <button onClick={() => toast("Password reset link sent")} className="btn-outline w-full !py-2 text-sm mb-2">Change password</button>
        <button onClick={() => toast("Logged out other devices")} className="btn-outline w-full !py-2 text-sm">Log out all devices</button>
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
