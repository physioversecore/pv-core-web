"use client";

import { useState } from "react";
import { toast } from "sonner";

const FAQ = [
  { q: "How are therapists verified?", a: "All physiotherapists must upload their NMC license and certification. Our team reviews and approves within 24 hours." },
  { q: "What are the cancellation policies?", a: "You can cancel up to 6 hours before your session for a full refund." },
  { q: "Which areas do you cover?", a: "Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan, and Biratnagar." },
  { q: "How are payments handled?", a: "We accept eSewa, Khalti, and cash on visit." },
];

const THERAPISTS = ["Rajesh Shrestha", "Anita Tamang", "Sunita Karki"];
const REASONS = ["Unprofessional behaviour", "Late or no-show", "Incorrect treatment", "Billing dispute", "Other"];

export default function Settings() {
  const [open, setOpen] = useState<number | null>(0);
  const [msg, setMsg] = useState("");
  const [c, setC] = useState({ therapist: "", reason: REASONS[0], details: "" });
  const [prefs, setPrefs] = useState({ emailNotif: true, smsNotif: true, marketing: false });

  const submitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.therapist) return toast.error("Select the physiotherapist");
    if (c.details.trim().length < 10) return toast.error("Please describe the issue (10+ chars)");
    toast.success("Complaint sent to admin. We'll follow up within 24h.");
    setC({ therapist: "", reason: REASONS[0], details: "" });
  };

  return (
    <div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          <form onSubmit={submitComplaint} className="card-soft p-5">
            <p className="eyebrow mb-1">File a complaint</p>
            <h3 className="font-display text-lg mb-3">Report an issue with a physiotherapist</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-slate">Physiotherapist</label>
                <select value={c.therapist} onChange={(e) => setC({ ...c, therapist: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                  <option value="">Select…</option>
                  {THERAPISTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate">Reason</label>
                <select value={c.reason} onChange={(e) => setC({ ...c, reason: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm">
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <label className="text-xs font-medium text-slate">Describe what happened</label>
            <textarea value={c.details} onChange={(e) => setC({ ...c, details: e.target.value })} rows={4} maxLength={1000} placeholder="Please share dates, sessions, and any specific concerns…" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm" />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate">Your identity is shared with admin only.</span>
              <button type="submit" className="btn-pine !px-5">Send complaint</button>
            </div>
          </form>

          <div className="card-soft p-5">
            <p className="eyebrow mb-3">Notification preferences</p>
            <Toggle label="Email notifications" v={prefs.emailNotif} on={(v) => setPrefs({ ...prefs, emailNotif: v })} />
            <Toggle label="SMS reminders" v={prefs.smsNotif} on={(v) => setPrefs({ ...prefs, smsNotif: v })} />
            <Toggle label="Marketing & offers" v={prefs.marketing} on={(v) => setPrefs({ ...prefs, marketing: v })} />
            <button onClick={() => toast.success("Preferences saved")} className="btn-outline !py-1.5 !px-4 text-xs mt-2">Save preferences</button>
          </div>

          <div className="card-soft p-5">
            <p className="eyebrow mb-3">FAQ</p>
            <div className="divide-y divide-border">
              {FAQ.map((f, i) => (
                <div key={i} className="py-3">
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left flex justify-between items-center font-medium">
                    {f.q}<span className="text-slate">{open === i ? "−" : "+"}</span>
                  </button>
                  {open === i && <p className="text-sm text-slate mt-2">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">Emergency physio hotline</p>
            <div className="font-display text-2xl text-pine">+977-1-555-0100</div>
            <p className="text-xs text-slate mt-1">24/7 urgent support</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent"); setMsg(""); }} className="card-soft p-5">
            <p className="eyebrow mb-3">Contact support</p>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="How can we help?" className="w-full px-3 py-2.5 rounded-xl border border-border bg-white" />
            <button type="submit" className="btn-pine w-full mt-3">Send</button>
          </form>
          <div className="card-soft p-5">
            <p className="eyebrow mb-2">Account</p>
            <button onClick={() => toast("Password reset link sent")} className="btn-outline w-full !py-2 text-sm mb-2">Change password</button>
            <button onClick={() => toast.error("Contact support to delete account")} className="w-full text-xs text-red-600 underline">Delete my account</button>
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
      <button type="button" onClick={() => on(!v)} className={`w-10 h-6 rounded-full transition relative ${v ? "bg-pine" : "bg-border"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${v ? "translate-x-4" : ""}`} />
      </button>
    </label>
  );
}
