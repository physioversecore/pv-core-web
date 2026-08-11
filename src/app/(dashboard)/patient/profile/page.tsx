"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Check,
  ClipboardList,
  HeartHandshake,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User as UserIcon,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useLang, type TKey } from "@/context/i18n";
import { CITIES } from "@/lib/constants";
import { getPatientProfile, updatePatientProfile } from "@/services/api/profile";
import type { PatientProfile } from "@/types";

type TabKey = "personal" | "medical" | "emergency";

interface Draft {
  name: string;
  phone: string;
  city: string;
  address: string;
  history: string;
  dob: string;
  gender: "Any" | "Male" | "Female";
  notifEmail: boolean;
  notifSms: boolean;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  phone: "",
  city: "Kathmandu",
  address: "",
  history: "",
  dob: "",
  gender: "Any",
  notifEmail: true,
  notifSms: false,
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
};

const TABS: { key: TabKey; label: TKey; inactive: string }[] = [
  { key: "personal", label: "patient_dashboard.profileTabPersonal", inactive: "text-text-light" },
  { key: "medical", label: "patient_dashboard.profileTabMedical", inactive: "text-primary" },
  { key: "emergency", label: "patient_dashboard.profileTabEmergency", inactive: "text-danger" },
];

export default function Profile() {
  const { t } = useLang();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabKey>("personal");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    getPatientProfile()
      .then((p) => {
        setProfile(p);
        setDraft(draftFromProfile(p));
      })
      .catch((err) => {
        if (err?.message !== "Patient profile not found") {
          toast.error(err?.message ?? "Something went wrong");
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  const conditions = (profile?.condition ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const initials = (profile?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const ageLine = [profile?.age ? `${profile.age} ${t("patient_dashboard.profileYrs")}` : null]
    .filter(Boolean)
    .join("");

  const switchTab = (next: TabKey) => {
    setTab(next);
    setEditing(false);
    if (profile) setDraft(draftFromProfile(profile));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<PatientProfile> = {};
      if (tab === "personal") {
        payload.name = draft.name;
        payload.phone = draft.phone || profile?.phone;
        payload.city = draft.city;
        payload.address = draft.address || undefined;
        payload.dob = draft.dob || undefined;
      } else if (tab === "medical") {
        payload.history = draft.history || undefined;
        payload.gender = draft.gender;
        payload.notifEmail = draft.notifEmail;
        payload.notifSms = draft.notifSms;
      } else {
        payload.emergencyName = draft.emergencyName;
        payload.emergencyRelation = draft.emergencyRelation;
        payload.emergencyPhone = draft.emergencyPhone;
      }
      const updated = await updatePatientProfile(payload);
      setProfile(updated);
      setDraft(draftFromProfile(updated));
      setEditing(false);
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

  const panelTitle =
    tab === "personal"
      ? t("patient_dashboard.profilePersonalInfo")
      : tab === "medical"
        ? t("patient_dashboard.profileMedicalInfo")
        : t("patient_dashboard.profileEmergencyInfo");

  return (
    <div className="card-soft max-w-2xl overflow-hidden">
      {/* ID-card header */}
      <div className="flex items-center gap-3.5 px-5 py-5 bg-surface border-b border-border">
        <div className="w-[60px] h-[60px] rounded-full bg-primary/15 text-primary grid place-items-center text-lg font-medium shrink-0">
          {initials || <UserIcon size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-medium text-text">{profile?.name}</div>
          <div className="text-xs text-text-light mt-px">
            {[ageLine, `${t("patient_dashboard.profilePatientId")} #${patientCode(profile)}`]
              .filter(Boolean)
              .join(" · ")}
          </div>
          {conditions.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {conditions.map((c, i) => (
                <span
                  key={c}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    i % 2 === 0 ? "bg-warn-bg text-warn-ink" : "bg-danger-bg text-danger-ink"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder tabs */}
      <div className="flex gap-1 px-3 mt-3">
        {TABS.map((tb) => {
          const isActive = tab === tb.key;
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => switchTab(tb.key)}
              className={`flex-1 text-center py-2.5 rounded-t-xl border text-xs font-medium transition-colors relative top-px cursor-pointer ${
                isActive
                  ? "bg-card border-border text-text"
                  : `bg-transparent border-transparent hover:text-text ${tb.inactive}`
              }`}
            >
              {t(tb.label)}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="border border-border rounded-b-xl mx-3 mb-4 bg-card p-4">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[13px] font-medium text-text-light">{panelTitle}</span>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 text-primary bg-transparent text-xs font-medium hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Pencil size={12} />
              {t("patient_dashboard.profileEdit")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                if (profile) setDraft(draftFromProfile(profile));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-light bg-transparent text-xs font-medium hover:bg-surface transition-colors cursor-pointer"
            >
              <X size={12} />
              {t("patient_dashboard.profileCancel")}
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="flex flex-col gap-3.5">
            {tab === "personal" && (
              <>
                <Field label={t("patient_dashboard.fullName")}>
                  <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
                </Field>
                <Field label={t("patient_dashboard.profileDateOfBirth")}>
                  <input type="date" className={inputCls} value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
                </Field>
                <Field label={t("patient_dashboard.homeAddress")}>
                  <input className={inputCls} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </Field>
                <Field label={t("patient_dashboard.city")}>
                  <select className={inputCls} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("patient_dashboard.phone")}>
                  <input className={inputCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} required />
                </Field>
              </>
            )}
            {tab === "medical" && (
              <>
                {conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.map((c, i) => (
                      <span
                        key={c}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          i % 2 === 0 ? "bg-warn-bg text-warn-ink" : "bg-danger-bg text-danger-ink"
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <Field label={t("patient_dashboard.medicalHistory")}>
                  <textarea className={inputCls} rows={3} value={draft.history} onChange={(e) => setDraft({ ...draft, history: e.target.value })} />
                </Field>
                <Field label={t("patient_dashboard.preferredGender")}>
                  <select className={inputCls} value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as "Any" | "Male" | "Female" })}>
                    <option value="Any">{t("patient_dashboard.any")}</option>
                    <option value="Male">{t("patient_dashboard.male")}</option>
                    <option value="Female">{t("patient_dashboard.female")}</option>
                  </select>
                </Field>
                <div>
                  <label className="text-xs font-medium text-text-light">{t("patient_dashboard.notifications")}</label>
                  <div className="mt-1.5 flex gap-5 text-sm text-text">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={draft.notifEmail} onChange={(e) => setDraft({ ...draft, notifEmail: e.target.checked })} />
                      {t("patient_dashboard.email")}
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={draft.notifSms} onChange={(e) => setDraft({ ...draft, notifSms: e.target.checked })} />
                      {t("patient_dashboard.sms")}
                    </label>
                  </div>
                </div>
              </>
            )}
            {tab === "emergency" && (
              <>
                <p className="text-xs text-text-muted">{t("patient_dashboard.profileEmergencyHint")}</p>
                <Field label={t("patient_dashboard.profileEmergencyName")}>
                  <input className={inputCls} value={draft.emergencyName} onChange={(e) => setDraft({ ...draft, emergencyName: e.target.value })} />
                </Field>
                <Field label={t("patient_dashboard.profileEmergencyRelation")}>
                  <input className={inputCls} value={draft.emergencyRelation} onChange={(e) => setDraft({ ...draft, emergencyRelation: e.target.value })} />
                </Field>
                <Field label={t("patient_dashboard.profileEmergencyPhone")}>
                  <input className={inputCls} value={draft.emergencyPhone} onChange={(e) => setDraft({ ...draft, emergencyPhone: e.target.value })} placeholder="+977 ..." />
                </Field>
              </>
            )}
            <button type="submit" disabled={saving} className="btn-secondary disabled:opacity-50 self-start">
              {saving ? (
                t("common.submitting")
              ) : (
                <>
                  <Check size={14} />
                  {t("common.saveChanges")}
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3.5">
            {tab === "personal" && (
              <>
                <Row icon={<UserIcon size={14} />} label={t("patient_dashboard.fullName")} value={profile?.name ?? "—"} />
                <Row icon={<MapPin size={14} />} label={t("patient_dashboard.homeAddress")} value={fullAddress(profile)} />
                <Row icon={<Phone size={14} />} label={t("patient_dashboard.phone")} value={profile?.phone ?? "—"} />
                <Row icon={<Mail size={14} />} label={t("patient_dashboard.profileEmail")} value={user?.email ?? "—"} />
              </>
            )}
            {tab === "medical" && (
              <>
                <Row
                  icon={<Activity size={14} />}
                  label={t("patient_dashboard.profileConditions")}
                  value={conditions.length ? conditions.join(", ") : t("patient_dashboard.profileNoConditions")}
                />
                <Row icon={<ClipboardList size={14} />} label={t("patient_dashboard.medicalHistory")} value={profile?.history || t("patient_dashboard.profileNoConditions")} />
                <Row
                  icon={<UserRound size={14} />}
                  label={t("patient_dashboard.preferredGender")}
                  value={profile ? t(genderKey(profile.gender)) : "—"}
                />
                <Row
                  icon={<Bell size={14} />}
                  label={t("patient_dashboard.notifications")}
                  value={[profile?.notifEmail ? t("patient_dashboard.email") : null, profile?.notifSms ? t("patient_dashboard.sms") : null]
                    .filter(Boolean)
                    .join(", ") || "—"}
                />
              </>
            )}
            {tab === "emergency" && (
              <>
                <Row icon={<UserRound size={14} />} label={t("patient_dashboard.profileEmergencyName")} value={profile?.emergencyName || t("patient_dashboard.profileNoEmergency")} />
                <Row icon={<HeartHandshake size={14} />} label={t("patient_dashboard.profileEmergencyRelation")} value={profile?.emergencyRelation || "—"} />
                <Row icon={<Phone size={14} />} label={t("patient_dashboard.profileEmergencyPhone")} value={profile?.emergencyPhone || "—"} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function draftFromProfile(p: PatientProfile): Draft {
  return {
    name: p.name,
    phone: p.phone,
    city: p.city,
    address: p.address ?? "",
    history: p.history ?? "",
    dob: p.dob ? p.dob.slice(0, 10) : "",
    gender: p.gender,
    notifEmail: p.notifEmail,
    notifSms: p.notifSms,
    emergencyName: p.emergencyName ?? "",
    emergencyRelation: p.emergencyRelation ?? "",
    emergencyPhone: p.emergencyPhone ?? "",
  };
}

function patientCode(p: PatientProfile | null): string {
  if (!p) return "—";
  return p.id.slice(-6).toUpperCase();
}

function fullAddress(p: PatientProfile | null): string {
  if (!p) return "—";
  return [p.address, p.city].filter(Boolean).join(", ") || "—";
}

function genderKey(g: "Any" | "Male" | "Female"): TKey {
  if (g === "Male") return "patient_dashboard.male";
  if (g === "Female") return "patient_dashboard.female";
  return "patient_dashboard.any";
}

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-[30px] h-[30px] rounded-lg bg-surface text-text-muted grid place-items-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-text-muted">{label}</div>
        <div className="text-sm text-text mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}
