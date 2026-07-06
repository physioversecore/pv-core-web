"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";

export default function TProfile() {
  const { user } = useAuth();
  const [f, setF] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: "",
    specialty: user?.specialty ?? "General",
    experience: 5,
    fee: 1200,
    hours: "09:00–18:00",
    city: user?.city ?? "Kathmandu",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved"); }} className="card-soft p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface grid place-items-center text-secondary font-display text-xl">{f.name[0] ?? "T"}</div>
        <button type="button" onClick={() => toast("Photo uploaded")} className="btn-outline !py-1.5 !px-3 text-xs">Upload photo</button>
      </div>
      <Field label="Full name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
      <div>
        <label className="text-xs font-medium text-text-light">Bio</label>
        <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField label="Specialty" value={f.specialty} onChange={(v) => setF({ ...f, specialty: v })} options={[...SPECIALTIES]} />
        <Field label="Years of experience" type="number" value={String(f.experience)} onChange={(v) => setF({ ...f, experience: +v })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Fee per session (NPR)" type="number" value={String(f.fee)} onChange={(v) => setF({ ...f, fee: +v })} />
        <Field label="Availability hours" value={f.hours} onChange={(v) => setF({ ...f, hours: v })} />
      </div>
      <SelectField label="Primary city" value={f.city} onChange={(v) => setF({ ...f, city: v })} options={[...CITIES]} />
      <div className="p-3 rounded-xl bg-surface/60 text-xs text-text-light">NMC License: <span className="font-mono text-secondary">NMC-PT-2018-XXXX</span> · <span className="chip !bg-secondary !text-white">Verified</span></div>
      <button type="submit" className="btn-pine">Save changes</button>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">{options.map((o) => <option key={o}>{o}</option>)}</select>
    </div>
  );
}
