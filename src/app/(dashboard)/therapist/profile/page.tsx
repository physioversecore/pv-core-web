"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

export default function TProfile() {
  const { t } = useLang();
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
    <form onSubmit={(e) => { e.preventDefault(); toast.success(t("therapist_dashboard.profileSaved")); }} className="card-soft p-6 max-w-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface grid place-items-center text-secondary font-display text-xl">{f.name[0] ?? "T"}</div>
        <button type="button" onClick={() => toast(t("therapist_dashboard.uploadPhoto"))} className="btn-outline !py-1.5 !px-3 text-xs">{t("therapist_dashboard.uploadPhoto")}</button>
      </div>
      <Field label={t("therapist_dashboard.fullName")} value={f.name} onChange={(v) => setF({ ...f, name: v })} />
      <Field label={t("therapist_dashboard.phone")} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
      <div>
        <label className="text-xs font-medium text-text-light">{t("therapist_dashboard.bio")}</label>
        <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField label={t("therapist_dashboard.specialty")} value={f.specialty} onChange={(v) => setF({ ...f, specialty: v })} options={[...SPECIALTIES]} />
        <Field label={t("therapist_dashboard.yearsExperience")} type="number" value={String(f.experience)} onChange={(v) => setF({ ...f, experience: +v })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("therapist_dashboard.feePerSession")} type="number" value={String(f.fee)} onChange={(v) => setF({ ...f, fee: +v })} />
        <Field label={t("therapist_dashboard.availabilityHours")} value={f.hours} onChange={(v) => setF({ ...f, hours: v })} />
      </div>
      <SelectField label={t("therapist_dashboard.primaryCity")} value={f.city} onChange={(v) => setF({ ...f, city: v })} options={[...CITIES]} />
      <div className="p-3 rounded-xl bg-surface/60 text-xs text-text-light">{t("therapist_dashboard.nmcLicense")} <span className="font-mono text-secondary">NMC-PT-2018-XXXX</span> · <span className="chip !bg-secondary !text-white">{t("therapist_dashboard.verified")}</span></div>
      <button type="submit" className="btn-pine">{t("common.saveChanges")}</button>
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
