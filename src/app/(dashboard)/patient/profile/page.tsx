"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { CITIES } from "@/lib/mock";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "Kathmandu",
    address: "",
    history: "",
    gender: "Any",
    notif: { email: true, sms: false },
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); toast.success("Profile saved"); };

  return (
    <div>
      <form onSubmit={save} className="card-soft p-6 max-w-2xl space-y-4">
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div>
          <label className="text-xs font-medium text-text-light">City</label>
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label="Home address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <div>
          <label className="text-xs font-medium text-text-light">Medical history notes</label>
          <textarea value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">Preferred therapist gender</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            <option>Any</option><option>Male</option><option>Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">Notifications</label>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.email} onChange={(e) => setForm({ ...form, notif: { ...form.notif, email: e.target.checked } })} /> Email</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.sms} onChange={(e) => setForm({ ...form, notif: { ...form.notif, sms: e.target.checked } })} /> SMS</label>
          </div>
        </div>
        <button type="submit" className="btn-pine">Save changes</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
