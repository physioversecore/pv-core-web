"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Activity,
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Upload,
  User as UserIcon,
  UserRound,
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
  notifEmail: true,
  notifSms: false,
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
};

const TABS: { key: TabKey; label: string; inactive: string }[] = [
  { key: "personal", label: "Personal", inactive: "text-text-light" },
  { key: "medical", label: "Medical", inactive: "text-primary" },
  { key: "emergency", label: "Emergency", inactive: "text-danger" },
  { key: "family", label: "Family", inactive: "text-secondary" },
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
      setPhotoError("Only JPG, PNG, and WebP images are allowed.");
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoStatus("error");
      setPhotoError("Photo must be under 5MB.");
      toast.error("Photo must be under 5MB.");
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
            toast.success("Photo uploaded successfully!");
          } else {
            setPhotoStatus("error");
            setPhotoError("Upload failed.");
          }
        } catch {
          setPhotoStatus("error");
          setPhotoError("Upload failed.");
        }
      } else {
        setPhotoStatus("error");
        setPhotoError("Upload failed.");
      }
    };

    xhr.onerror = () => {
      setPhotoProgress(0);
      setPhotoStatus("error");
      setPhotoError("Upload failed.");
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
        toast.success("Photo removed.");
      } else {
        toast.error("Failed to remove photo.");
      }
    };

    xhr.onerror = () => toast.error("Failed to remove photo.");
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
      toast.error("Name and relationship are required.");
      return;
    }
    try {
      const member = await addFamilyMember(familyDraft);
      setFamilyMembers((prev) => [...prev, member]);
      resetFamilyDraft();
      toast.success("Family member added.");
    } catch {
      toast.error("Failed to add family member.");
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
      toast.success("Family member updated.");
    } catch {
      toast.error("Failed to update family member.");
    }
  }

  async function handleDeleteFamily(id: string) {
    try {
      await deleteFamilyMember(id);
      setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Family member removed.");
    } catch {
      toast.error("Failed to remove family member.");
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
    return <div className="p-6 text-text-light">{t("common.loading")}</div>;
  }

  const panelTitle =
    tab === "personal"
      ? t("patient_dashboard.profilePersonalInfo")
      : tab === "medical"
        ? t("patient_dashboard.profileMedicalInfo")
        : tab === "emergency"
          ? t("patient_dashboard.profileEmergencyInfo")
          : "Family Members";

  return (
    <div className="card-soft max-w-2xl overflow-hidden">
      {/* ─── Header with photo ─── */}
      <div className="flex items-center gap-3.5 px-5 py-5 bg-surface border-b border-border">
        <div className="relative group shrink-0">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Profile"
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/15 text-primary grid place-items-center text-lg font-medium">
              {initials || <UserIcon size={20} />}
            </div>
          )}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-text/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-medium text-text">{profile?.name}</div>
          <div className="text-xs text-text-light mt-px">
            {[ageLine, `Patient #${patientCode(profile)}`].filter(Boolean).join(" · ")}
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
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-[11px] font-medium text-text-light hover:bg-white transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              {photoPreview ? "Replace photo" : "Upload photo"}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          {photoStatus === "uploading" && (
            <div className="mt-2 w-48">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${photoProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-text-light mt-0.5 block">
                Uploading {photoProgress}%
              </span>
            </div>
          )}
          {photoStatus === "success" && (
            <span className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
          )}
          {photoStatus === "error" && (
            <span className="text-[10px] text-red-500 mt-1 block">{photoError}</span>
          )}
          {photoFile && photoStatus !== "success" && photoStatus !== "uploading" && (
            <button
              type="button"
              onClick={uploadPhoto}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" /> Save photo
            </button>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
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
              {tb.label}
            </button>
          );
        })}
      </div>

      {/* ─── Content panel ─── */}
      <div className="border border-border rounded-b-xl mx-3 mb-4 bg-card p-4">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[13px] font-medium text-text-light">{panelTitle}</span>
          {tab !== "family" && (
            !editing ? (
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
            )
          )}
        </div>

        {/* ─── Personal / Medical / Emergency tabs ─── */}
        {tab !== "family" && (
          editing ? (
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
                    <input className={inputCls} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="e.g. Kathmandu, Pokhara" />
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
                {saving ? t("common.submitting") : (
                  <><Check size={14} /> {t("common.saveChanges")}</>
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
          )
        )}

        {/* ─── Family tab ─── */}
        {tab === "family" && (
          <div className="flex flex-col gap-3.5">
            <p className="text-xs text-text-light">
              Add family members who also need physiotherapy.
            </p>

            {familyLoading ? (
              <div className="text-xs text-text-light py-4 text-center">Loading...</div>
            ) : (
              familyMembers.map((fm, i) => (
                <div key={fm.id} className="rounded-lg border border-border bg-surface/50 p-3 space-y-2">
                  {familyEditingIdx === i ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Name">
                          <input className={inputCls} value={familyDraft.name} onChange={(e) => setFamilyDraft({ ...familyDraft, name: e.target.value })} required />
                        </Field>
                        <Field label="Relationship">
                          <select className={inputCls} value={familyDraft.relationship} onChange={(e) => setFamilyDraft({ ...familyDraft, relationship: e.target.value })} required>
                            <option value="">Select</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Child">Child</option>
                            <option value="Other">Other</option>
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Date of birth">
                          <input type="date" className={inputCls} value={familyDraft.dob} onChange={(e) => setFamilyDraft({ ...familyDraft, dob: e.target.value })} />
                        </Field>
                        <Field label="Phone">
                          <input className={inputCls} value={familyDraft.phone} onChange={(e) => setFamilyDraft({ ...familyDraft, phone: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Condition (optional)">
                        <input className={inputCls} value={familyDraft.condition} onChange={(e) => setFamilyDraft({ ...familyDraft, condition: e.target.value })} placeholder="What they need help with" />
                      </Field>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleUpdateFamily} className="btn-secondary !py-1.5 !px-3 text-xs">
                          <Check size={12} /> Save
                        </button>
                        <button type="button" onClick={resetFamilyDraft} className="text-xs text-text-light hover:text-text cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-text">{fm.name}</div>
                        <div className="text-xs text-text-light">{fm.relationship}</div>
                        {fm.phone && <div className="text-xs text-text-light">{fm.phone}</div>}
                        {fm.condition && <div className="text-xs text-text-light italic">Condition: {fm.condition}</div>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button type="button" onClick={() => startEditFamily(i)} className="p-1 rounded-md hover:bg-surface text-text-light hover:text-text transition-colors cursor-pointer">
                          <Pencil size={12} />
                        </button>
                        <button type="button" onClick={() => handleDeleteFamily(fm.id)} className="p-1 rounded-md hover:bg-red-50 text-text-light hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add new family member form */}
            {familyEditingIdx === null && (
              <div className="rounded-lg border-2 border-dashed border-border p-3 space-y-2">
                <div className="text-xs font-medium text-text-light">Add family member</div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Name">
                    <input className={inputCls} value={familyDraft.name} onChange={(e) => setFamilyDraft({ ...familyDraft, name: e.target.value })} placeholder="Full name" />
                  </Field>
                  <Field label="Relationship">
                    <select className={inputCls} value={familyDraft.relationship} onChange={(e) => setFamilyDraft({ ...familyDraft, relationship: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Date of birth">
                    <input type="date" className={inputCls} value={familyDraft.dob} onChange={(e) => setFamilyDraft({ ...familyDraft, dob: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <input className={inputCls} value={familyDraft.phone} onChange={(e) => setFamilyDraft({ ...familyDraft, phone: e.target.value })} placeholder="Optional" />
                  </Field>
                </div>
                <Field label="Condition (optional)">
                  <input className={inputCls} value={familyDraft.condition} onChange={(e) => setFamilyDraft({ ...familyDraft, condition: e.target.value })} placeholder="What they need help with" />
                </Field>
                <button
                  type="button"
                  onClick={handleAddFamily}
                  disabled={!familyDraft.name.trim() || !familyDraft.relationship.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-medium hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={12} /> Add member
                </button>
              </div>
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
