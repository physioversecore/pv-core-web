"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

export default function Profile() {
  const { t } = useLang();
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

  const save = (e: React.FormEvent) => { e.preventDefault(); toast.success(t("patient_dashboard.profileSaved")); };

  return (
    <div>
      <form onSubmit={save} className="card-soft p-6 max-w-2xl space-y-4">
        <Field label={t("patient_dashboard.fullName")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label={t("patient_dashboard.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <div>
          <label className="text-xs font-medium text-text-light">{t("patient_dashboard.city")}</label>
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Field label={t("patient_dashboard.homeAddress")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <div>
          <label className="text-xs font-medium text-text-light">{t("patient_dashboard.medicalHistory")}</label>
          <textarea value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("patient_dashboard.preferredGender")}</label>
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            <option>{t("patient_dashboard.any")}</option><option>{t("patient_dashboard.male")}</option><option>{t("patient_dashboard.female")}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("patient_dashboard.notifications")}</label>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.email} onChange={(e) => setForm({ ...form, notif: { ...form.notif, email: e.target.checked } })} /> {t("patient_dashboard.email")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.sms} onChange={(e) => setForm({ ...form, notif: { ...form.notif, sms: e.target.checked } })} /> {t("patient_dashboard.sms")}</label>
          </div>
        </div>
        <button type="submit" className="btn-secondary">{t("common.saveChanges")}</button>
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
