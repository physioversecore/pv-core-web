"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { CITIES } from "@/lib/constants";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { getPatientProfile, updatePatientProfile } from "@/services/api/profile";

export default function Profile() {
  const { t } = useLang();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "Kathmandu",
    address: "",
    history: "",
    gender: "Any",
    notif: { email: true, sms: false },
  });

  useEffect(() => {
    getPatientProfile()
      .then((profile) => {
        setForm({
          name: profile.name,
          phone: profile.phone,
          city: profile.city,
          address: profile.address ?? "",
          history: profile.history ?? "",
          gender: profile.gender,
          notif: { email: profile.notifEmail, sms: profile.notifSms },
        });
      })
      .catch((err) => {
        if (err?.message !== "Patient profile not found") {
          toast.error(err?.message ?? "Something went wrong");
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePatientProfile({
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address || undefined,
        history: form.history || undefined,
        gender: form.gender as "Any" | "Male" | "Female",
        notifEmail: form.notif.email,
        notifSms: form.notif.sms,
      });
      toast.success(t("patient_dashboard.profileSaved"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-text-light">{t("common.loading")}</div>;
  }

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
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "Any" | "Male" | "Female" })} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white">
            <option value="Any">{t("patient_dashboard.any")}</option><option value="Male">{t("patient_dashboard.male")}</option><option value="Female">{t("patient_dashboard.female")}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-light">{t("patient_dashboard.notifications")}</label>
          <div className="mt-1 flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.email} onChange={(e) => setForm({ ...form, notif: { ...form.notif, email: e.target.checked } })} /> {t("patient_dashboard.email")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.notif.sms} onChange={(e) => setForm({ ...form, notif: { ...form.notif, sms: e.target.checked } })} /> {t("patient_dashboard.sms")}</label>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-secondary disabled:opacity-50">
          {saving ? t("common.submitting") : t("common.saveChanges")}
        </button>
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
