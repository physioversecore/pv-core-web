"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Activity,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HeartHandshake,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Upload,
  User as UserIcon,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useLang, type TKey } from "@/context/i18n";
import { CITIES } from "@/lib/constants";
import { getPatientProfile, updatePatientProfile } from "@/services/api/profile";
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "@/services/api/patients";
import { formatDate } from "@/lib/format";
import type { PatientProfile } from "@/types";

type TabKey = "personal" | "medical" | "emergency" | "family";

interface Draft {
  name: string;
  phone: string;
  city: string;
  address: string;
  history: string;
  dob: string;
  gender: "Any" | "Male" | "Female";
  condition: string;
  notifEmail: boolean;
  notifSms: boolean;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dob?: string;
  phone?: string;
  gender?: string;
  condition?: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  phone: "",
  city: "Kathmandu",
  address: "",
  history: "",
  dob: "",
  gender: "Any",
  condition: "",
  notifEmail: true,
  notifSms: false,
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
};

const TABS: { key: TabKey; labelKey: TKey; icon: ReactNode }[] = [
  { key: "personal", labelKey: "patient_dashboard.profileTabPersonal", icon: <UserIcon size={13} /> },
  { key: "medical", labelKey: "patient_dashboard.profileTabMedical", icon: <Activity size={13} /> },
  { key: "emergency", labelKey: "patient_dashboard.profileTabEmergency", icon: <HeartHandshake size={13} /> },
  { key: "family", labelKey: "patient_dashboard.profileTabFamily", icon: <Users size={13} /> },
];

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export default function Profile() {
  const { t } = useLang();
  const { user, refreshSession } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabKey>("personal");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [photoError, setPhotoError] = useState("");

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyEditingIdx, setFamilyEditingIdx] = useState<number | null>(null);
  const [familyDraft, setFamilyDraft] = useState({
    name: "",
    relationship: "",
    dob: "",
    phone: "",
    gender: "",
    condition: "",
  });

  useEffect(() => {
    getPatientProfile()
      .then((p) => {
        setProfile(p);
        setDraft(draftFromProfile(p));
        setPhotoPreview(p.photo ?? null);
      })
      .catch((err) => {
        if (err?.message !== "Patient profile not found") {
          toast.error(err?.message ?? "Something went wrong");
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (tab !== "family") return;
    setFamilyLoading(true);
    getFamilyMembers()
      .then(setFamilyMembers)
      .catch(() => {})
      .finally(() => setFamilyLoading(false));
  }, [tab]);

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

  const ageLine = [profile?.age ? `${profile.age} yrs` : null].filter(Boolean).join("");

  const switchTab = (next: TabKey) => {
    setTab(next);
    setEditing(false);
    setFamilyEditingIdx(null);
    if (profile) setDraft(draftFromProfile(profile));
  };

  // ─── Photo upload ────────────────────────────────────────────────────────

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoStatus("error");
      setPhotoError(t("patient_dashboard.invalidPhotoType"));
      toast.error(t("patient_dashboard.invalidPhotoType"));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoStatus("error");
      setPhotoError(t("patient_dashboard.photoTooLarge"));
      toast.error(t("patient_dashboard.photoTooLarge"));
      return;
    }
    setPhotoFile(file);
    setPhotoError("");
    setPhotoStatus("idle");
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function uploadPhoto() {
    if (!photoFile || !profile) return;
    setPhotoStatus("uploading");
    setPhotoProgress(0);

    const formData = new FormData();
    formData.append("file", photoFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/v1/uploads/patients/${profile.id}/photo`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setPhotoProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setPhotoProgress(0);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const url: string | undefined = res?.url;
          if (url) {
            setPhotoPreview(url);
            setPhotoFile(null);
            setPhotoStatus("success");
            setProfile((prev) => (prev ? { ...prev, photo: url } : prev));
            void refreshSession();
            toast.success(t("patient_dashboard.photoUploaded"));
          } else {
            setPhotoStatus("error");
            setPhotoError(t("patient_dashboard.uploadFailedGeneric"));
          }
        } catch {
          setPhotoStatus("error");
          setPhotoError(t("patient_dashboard.uploadFailedGeneric"));
        }
      } else {
        setPhotoStatus("error");
        setPhotoError(t("patient_dashboard.uploadFailedGeneric"));
      }
    };

    xhr.onerror = () => {
      setPhotoProgress(0);
      setPhotoStatus("error");
      setPhotoError(t("patient_dashboard.uploadFailedGeneric"));
    };

    xhr.send(formData);
  }

  function removePhoto() {
    if (!profile) return;
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/api/v1/uploads/patients/${profile.id}/photo`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoProgress(0);
        setPhotoStatus("idle");
        setPhotoError("");
        if (photoInputRef.current) photoInputRef.current.value = "";
        setProfile((prev) => (prev ? { ...prev, photo: undefined } : prev));
        void refreshSession();
        toast.success(t("patient_dashboard.photoRemoved"));
      } else {
        toast.error(t("patient_dashboard.photoRemoveFailed"));
      }
    };

    xhr.onerror = () => toast.error(t("patient_dashboard.photoRemoveFailed"));
    xhr.send();
  }

  // ─── Profile save ────────────────────────────────────────────────────────

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
        payload.condition = draft.condition;
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

  // ─── Family members ──────────────────────────────────────────────────────

  async function handleAddFamily() {
    if (!familyDraft.name.trim() || !familyDraft.relationship.trim()) {
      toast.error(t("patient_dashboard.familyRequiredError"));
      return;
    }
    try {
      const member = await addFamilyMember(familyDraft);
      setFamilyMembers((prev) => [...prev, member]);
      resetFamilyDraft();
      toast.success(t("patient_dashboard.familyAdded"));
    } catch {
      toast.error(t("patient_dashboard.familyAddFailed"));
    }
  }

  async function handleUpdateFamily() {
    if (familyEditingIdx === null) return;
    const member = familyMembers[familyEditingIdx];
    if (!member) return;
    try {
      const updated = await updateFamilyMember(member.id, familyDraft);
      setFamilyMembers((prev) => prev.map((m, i) => (i === familyEditingIdx ? updated : m)));
      setFamilyEditingIdx(null);
      resetFamilyDraft();
      toast.success(t("patient_dashboard.familyUpdated"));
    } catch {
      toast.error(t("patient_dashboard.familyUpdateFailed"));
    }
  }

  async function handleDeleteFamily(id: string) {
    try {
      await deleteFamilyMember(id);
      setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(t("patient_dashboard.familyRemoved"));
    } catch {
      toast.error(t("patient_dashboard.familyRemoveFailed"));
    }
  }

  function startEditFamily(idx: number) {
    const m = familyMembers[idx];
    setFamilyDraft({
      name: m.name,
      relationship: m.relationship,
      dob: m.dob ? m.dob.slice(0, 10) : "",
      phone: m.phone ?? "",
      gender: m.gender ?? "",
      condition: m.condition ?? "",
    });
    setFamilyEditingIdx(idx);
  }

  function resetFamilyDraft() {
    setFamilyDraft({ name: "", relationship: "", dob: "", phone: "", gender: "", condition: "" });
    setFamilyEditingIdx(null);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="h-96 rounded-2xl bg-surface animate-pulse" />
        <div className="space-y-4">
          <div className="h-11 w-72 rounded-full bg-surface animate-pulse" />
          <div className="h-80 rounded-2xl bg-surface animate-pulse" />
        </div>
      </div>
    );
  }

  const panelTitle =
    tab === "personal"
      ? t("patient_dashboard.profilePersonalInfo")
      : tab === "medical"
        ? t("patient_dashboard.profileMedicalInfo")
        : tab === "emergency"
          ? t("patient_dashboard.profileEmergencyInfo")
          : t("patient_dashboard.familyTitle");

  return (
    <div className="max-w-5xl mx-auto pb-4">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* ─────────── Identity rail (signature panel) ─────────── */}
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl bg-secondary text-text-inverse overflow-hidden shadow-sm">
            <div className="h-1 bg-primary" />

            <div className="px-6 pt-7 pb-6 text-center">
              <div className="relative group inline-block">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Profile"
                    width={112}
                    height={112}
                    unoptimized
                    className="w-28 h-28 rounded-full object-cover ring-2 ring-text-inverse/15"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-text-inverse/10 ring-2 ring-text-inverse/15 grid place-items-center font-display text-3xl text-primary">
                    {initials || <UserIcon size={30} />}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label="Upload photo"
                  className="absolute inset-0 rounded-full bg-black/45 grid place-items-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <h2 className="font-display text-xl font-semibold mt-4 leading-tight break-words">
                {profile?.name || "—"}
              </h2>

              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-inverse/70 mt-2">
                {[ageLine, `#${patientCode(profile)}`].filter(Boolean).join(" · ")}
              </p>

              {conditions.length > 0 && (
                <div className="flex gap-1.5 mt-3.5 flex-wrap justify-center">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-text-inverse/10 text-text-inverse ring-1 ring-text-inverse/15"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick facts */}
            <dl className="border-t border-text-inverse/10 divide-y divide-text-inverse/10">
              <RailStat label={t("patient_dashboard.city")} value={profile?.city || "—"} />
              <RailStat label={t("patient_dashboard.phone")} value={profile?.phone || "—"} />
              <RailStat label={t("patient_dashboard.profileEmail")} value={user?.email || "—"} />
            </dl>

            {/* Photo controls */}
            <div className="px-6 py-5 border-t border-text-inverse/10 space-y-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-text-inverse text-secondary text-xs font-semibold hover:bg-text-inverse/90 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {photoPreview ? "Replace photo" : "Upload photo"}
              </button>

              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-text-inverse/20 text-text-inverse/75 text-xs font-medium hover:bg-danger/25 hover:text-text-inverse hover:border-transparent transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}

              {photoFile && photoStatus !== "success" && photoStatus !== "uploading" && (
                <button
                  type="button"
                  onClick={uploadPhoto}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:brightness-95 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save photo
                </button>
              )}

              {photoStatus === "uploading" && (
                <div className="pt-1">
                  <div className="h-1.5 bg-text-inverse/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${photoProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-inverse/75 mt-1 block">
                    Uploading {photoProgress}%
                  </span>
                </div>
              )}
              {photoStatus === "success" && (
                <span className="text-[10px] text-text-inverse flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Uploaded
                </span>
              )}
              {photoStatus === "error" && (
                <span className="text-[10px] text-red-200 block pt-0.5">{photoError}</span>
              )}

              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>
        </aside>

        {/* ─────────── Tabs + panel ─────────── */}
        <div className="min-w-0 space-y-4">
          <div className="tabs-filter !mb-0 !w-full sm:!w-fit overflow-x-auto no-scrollbar">
            {TABS.map((tb) => {
              const isActive = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  type="button"
                  onClick={() => switchTab(tb.key)}
                  aria-current={isActive}
                  className={`inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive ? "tab-active" : "text-text-light hover:text-text"
                  }`}
                >
                  {tb.icon}
                  {t(tb.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="card-soft p-6 lg:p-7">
            <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-text leading-tight">
                {panelTitle}
              </h2>
              {tab !== "family" && (
                !editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="btn-outline !py-2 !px-4 text-xs shrink-0 cursor-pointer"
                  >
                    <Pencil size={13} />
                    {t("patient_dashboard.profileEdit")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      if (profile) setDraft(draftFromProfile(profile));
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-text-light text-xs font-semibold hover:bg-surface transition-colors cursor-pointer shrink-0"
                  >
                    <X size={13} />
                    {t("patient_dashboard.profileCancel")}
                  </button>
                )
              )}
            </div>

            {/* ─── Personal / Medical / Emergency ─── */}
            {tab !== "family" && (
              editing ? (
                <form onSubmit={save} className="space-y-4">
                  {tab === "personal" && (
                    <>
                      <Field label={t("patient_dashboard.fullName")}>
                        <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label={t("patient_dashboard.profileDateOfBirth")}>
                          <input type="date" className={inputCls} value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} />
                        </Field>
                        <Field label={t("patient_dashboard.phone")}>
                          <input className={inputCls} value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} required />
                        </Field>
                      </div>
                      <Field label={t("patient_dashboard.homeAddress")}>
                        <input className={inputCls} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                      </Field>
                      <Field label={t("patient_dashboard.city")}>
                        <input className={inputCls} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Kathmandu, Pokhara" list="pv-cities" />
                        <datalist id="pv-cities">
                          {CITIES.map((c) => <option key={c} value={c} />)}
                        </datalist>
                      </Field>
                    </>
                  )}
                  {tab === "medical" && (
                    <>
                      <Field label={t("patient_dashboard.profileCondition")}>
                        <input
                          className={inputCls}
                          value={draft.condition}
                          onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
                          placeholder={t("patient_dashboard.profileConditionPlaceholder")}
                        />
                      </Field>
                      <Field label={t("patient_dashboard.medicalHistory")}>
                        <textarea className={`${inputCls} resize-y leading-relaxed`} rows={4} value={draft.history} onChange={(e) => setDraft({ ...draft, history: e.target.value })} />
                      </Field>
                      <Field label={t("patient_dashboard.preferredGender")}>
                        <SelectInput value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value as "Any" | "Male" | "Female" })}>
                          <option value="Any">{t("patient_dashboard.any")}</option>
                          <option value="Male">{t("patient_dashboard.male")}</option>
                          <option value="Female">{t("patient_dashboard.female")}</option>
                        </SelectInput>
                      </Field>
                      <div>
                        <FieldLabel>{t("patient_dashboard.notifications")}</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input type="checkbox" className="w-4 h-4 accent-primary" checked={draft.notifEmail} onChange={(e) => setDraft({ ...draft, notifEmail: e.target.checked })} />
                            {t("patient_dashboard.email")}
                          </label>
                          <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input type="checkbox" className="w-4 h-4 accent-primary" checked={draft.notifSms} onChange={(e) => setDraft({ ...draft, notifSms: e.target.checked })} />
                            {t("patient_dashboard.sms")}
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  {tab === "emergency" && (
                    <>
                      <p className="rounded-xl bg-warn-bg text-warn-ink text-xs leading-relaxed px-3.5 py-3">
                        {t("patient_dashboard.profileEmergencyHint")}
                      </p>
                      <Field label={t("patient_dashboard.profileEmergencyName")}>
                        <input className={inputCls} value={draft.emergencyName} onChange={(e) => setDraft({ ...draft, emergencyName: e.target.value })} />
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label={t("patient_dashboard.profileEmergencyRelation")}>
                          <input className={inputCls} value={draft.emergencyRelation} onChange={(e) => setDraft({ ...draft, emergencyRelation: e.target.value })} />
                        </Field>
                        <Field label={t("patient_dashboard.profileEmergencyPhone")}>
                          <input className={inputCls} value={draft.emergencyPhone} onChange={(e) => setDraft({ ...draft, emergencyPhone: e.target.value })} placeholder="+977 ..." />
                        </Field>
                      </div>
                    </>
                  )}
                  <div className="pt-1">
                    <button type="submit" disabled={saving} className="btn-secondary disabled:opacity-50">
                      {saving ? t("common.submitting") : (
                        <><Check size={14} /> {t("common.saveChanges")}</>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="divide-y divide-border">
                  {tab === "personal" && (
                    <>
                      <Row icon={<UserIcon size={14} />} label={t("patient_dashboard.fullName")} value={profile?.name ?? "—"} />
                      <Row
                        icon={<CalendarDays size={14} />}
                        label={t("patient_dashboard.profileDateOfBirth")}
                        value={dobLine(profile, t("patient_dashboard.profileYrs"))}
                      />
                      <Row icon={<MapPin size={14} />} label={t("patient_dashboard.homeAddress")} value={fullAddress(profile)} />
                      <Row icon={<MapPin size={14} />} label={t("patient_dashboard.city")} value={profile?.city || "—"} />
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
                </dl>
              )
            )}

            {/* ─── Family tab ─── */}
            {tab === "family" && (
              <div className="space-y-4">
                <p className="text-xs text-text-light leading-relaxed">
                  {t("patient_dashboard.familyHint")}
                </p>

                {familyLoading ? (
                  <div className="text-xs text-text-light py-6 text-center">{t("common.loading")}</div>
                ) : (
                  familyMembers.length > 0 && (
                    <ul className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                      {familyMembers.map((fm, i) => (
                        <li key={fm.id} className="p-3.5 bg-white">
                          {familyEditingIdx === i ? (
                            <div className="space-y-3">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <Field label={t("patient_dashboard.fullName")}>
                                  <input className={inputCls} value={familyDraft.name} onChange={(e) => setFamilyDraft({ ...familyDraft, name: e.target.value })} required />
                                </Field>
                                <Field label={t("patient_dashboard.relationshipLabel")}>
                                  <SelectInput value={familyDraft.relationship} onChange={(e) => setFamilyDraft({ ...familyDraft, relationship: e.target.value })} required>
                                    <option value="">{t("auth.selectOption")}</option>
                                    <option value="Spouse">{t("patient_dashboard.relSpouse")}</option>
                                    <option value="Parent">{t("patient_dashboard.relParent")}</option>
                                    <option value="Sibling">{t("patient_dashboard.relSibling")}</option>
                                    <option value="Child">{t("patient_dashboard.relChild")}</option>
                                    <option value="Other">{t("patient_dashboard.relOther")}</option>
                                  </SelectInput>
                                </Field>
                              </div>
                              <div className="grid sm:grid-cols-2 gap-3">
                                <Field label={t("patient_dashboard.profileDateOfBirth")}>
                                  <input type="date" className={inputCls} value={familyDraft.dob} onChange={(e) => setFamilyDraft({ ...familyDraft, dob: e.target.value })} />
                                </Field>
                                <Field label={t("patient_dashboard.phone")}>
                                  <input className={inputCls} value={familyDraft.phone} onChange={(e) => setFamilyDraft({ ...familyDraft, phone: e.target.value })} />
                                </Field>
                              </div>
                              <Field label={t("patient_dashboard.conditionOptional")}>
                                <input className={inputCls} value={familyDraft.condition} onChange={(e) => setFamilyDraft({ ...familyDraft, condition: e.target.value })} placeholder={t("patient_dashboard.profileConditionPlaceholder")} />
                              </Field>
                              <div className="flex items-center gap-3 pt-0.5">
                                <button type="button" onClick={handleUpdateFamily} className="btn-secondary !py-2 !px-4 text-xs">
                                  <Check size={13} /> {t("patient_dashboard.familySave")}
                                </button>
                                <button type="button" onClick={resetFamilyDraft} className="text-xs font-medium text-text-light hover:text-text cursor-pointer">
                                  {t("patient_dashboard.familyCancel")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-surface text-secondary grid place-items-center shrink-0 font-display text-sm font-semibold">
                                {fm.name.trim()[0]?.toUpperCase() ?? "?"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-text">{fm.name}</span>
                                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-surface text-secondary">
                                    {fm.relationship}
                                  </span>
                                </div>
                                {fm.phone && <div className="text-xs text-text-light mt-1">{fm.phone}</div>}
                                {fm.condition && (
                                  <div className="text-xs text-text-light mt-0.5">
                                    {t("patient_dashboard.profileCondition")}: {fm.condition}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button type="button" onClick={() => startEditFamily(i)} aria-label={t("patient_dashboard.profileEdit")} className="p-2 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition-colors cursor-pointer">
                                  <Pencil size={13} />
                                </button>
                                <button type="button" onClick={() => handleDeleteFamily(fm.id)} aria-label={t("patient_dashboard.familyRemoved")} className="p-2 rounded-lg hover:bg-danger/10 text-text-light hover:text-danger transition-colors cursor-pointer">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )
                )}

                {/* Add new family member */}
                {familyEditingIdx === null && (
                  <div className="rounded-xl border border-dashed border-border bg-background p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                        <Plus size={14} />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-light">
                        {t("patient_dashboard.familyTitle")}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label={t("patient_dashboard.fullName")}>
                        <input className={inputCls} value={familyDraft.name} onChange={(e) => setFamilyDraft({ ...familyDraft, name: e.target.value })} placeholder={t("patient_dashboard.fullName")} />
                      </Field>
                      <Field label={t("patient_dashboard.relationshipLabel")}>
                        <SelectInput value={familyDraft.relationship} onChange={(e) => setFamilyDraft({ ...familyDraft, relationship: e.target.value })}>
                          <option value="">{t("auth.selectOption")}</option>
                          <option value="Spouse">{t("patient_dashboard.relSpouse")}</option>
                          <option value="Parent">{t("patient_dashboard.relParent")}</option>
                          <option value="Sibling">{t("patient_dashboard.relSibling")}</option>
                          <option value="Child">{t("patient_dashboard.relChild")}</option>
                          <option value="Other">{t("patient_dashboard.relOther")}</option>
                        </SelectInput>
                      </Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label={t("patient_dashboard.profileDateOfBirth")}>
                        <input type="date" className={inputCls} value={familyDraft.dob} onChange={(e) => setFamilyDraft({ ...familyDraft, dob: e.target.value })} />
                      </Field>
                      <Field label={t("patient_dashboard.phone")}>
                        <input className={inputCls} value={familyDraft.phone} onChange={(e) => setFamilyDraft({ ...familyDraft, phone: e.target.value })} placeholder={t("patient_dashboard.conditionOptional")} />
                      </Field>
                    </div>
                    <Field label={t("patient_dashboard.conditionOptional")}>
                      <input className={inputCls} value={familyDraft.condition} onChange={(e) => setFamilyDraft({ ...familyDraft, condition: e.target.value })} placeholder={t("patient_dashboard.profileConditionPlaceholder")} />
                    </Field>
                    <button
                      type="button"
                      onClick={handleAddFamily}
                      disabled={!familyDraft.name.trim() || !familyDraft.relationship.trim()}
                      className="btn-outline-primary !py-2 !px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus size={13} /> {t("patient_dashboard.familyAdd")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
    condition: p.condition ?? "",
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

function dobLine(p: PatientProfile | null, yrsLabel: string): string {
  if (!p?.dob) return "—";
  const date = formatDate(p.dob.slice(0, 10));
  return p.age ? `${date} (${p.age} ${yrsLabel})` : date;
}

function genderKey(g: "Any" | "Male" | "Female"): TKey {
  if (g === "Male") return "patient_dashboard.male";
  if (g === "Female") return "patient_dashboard.female";
  return "patient_dashboard.any";
}

/* ─────────── Presentational helpers ─────────── */

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm text-text placeholder:text-text-muted transition focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-light">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}

function SelectInput({
  value,
  onChange,
  children,
  required = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`${inputCls} appearance-none pr-9 cursor-pointer`}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-text-light absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function RailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-inverse/70 shrink-0">
        {label}
      </dt>
      <dd className="text-sm font-medium text-text-inverse truncate">{value}</dd>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="w-8 h-8 rounded-lg bg-surface text-secondary grid place-items-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-light">
          {label}
        </dt>
        <dd className="text-sm text-text mt-1 break-words leading-relaxed">{value}</dd>
      </div>
    </div>
  );
}
