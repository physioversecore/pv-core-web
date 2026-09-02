"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { CITIES, SPECIALTIES } from "@/lib/constants";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import {
  Camera,
  Upload,
  Trash2,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Mail,
  ChevronDown,
  UserRound,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { getTherapistProfile, updateTherapistProfile } from "@/services/api/profile";
import type { TherapistProfile, TherapistProfileDocument } from "@/types";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_DOC_SIZE = 5 * 1024 * 1024;
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const DOC_TYPES = [
  "NMC License",
  "Degree Certificate",
  "ID Proof",
  "Certification",
  "Other",
];

const GENDERS = ["Male", "Female", "Other"];

function formatFileSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TProfile() {
  const { t } = useLang();
  const { user, refreshSession } = useAuth();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    bio: "",
    specialty: user?.specialty ?? "General",
    experience: 5,
    price: 1200,
    city: user?.city ?? "Kathmandu",
    gender: "Male",
    licenseNumber: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoStatus, setPhotoStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [photoError, setPhotoError] = useState("");

  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [docs, setDocs] = useState<TherapistProfileDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docType, setDocType] = useState("NMC License");

  useEffect(() => {
    getTherapistProfile()
      .then((profile) => {
        setProfile(profile);
        setDocs(profile.documents ?? []);
        setPhotoPreview(profile.photo ?? null);
        setF({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio ?? "",
          specialty: profile.specialty,
          experience: profile.experience,
          price: profile.price,
          city: profile.city,
          gender: profile.gender || "Male",
          licenseNumber: profile.licenseNumber ?? "",
        });
      })
      .catch((err) => {
        if (err?.message !== "Therapist profile not found") {
          toast.error(err?.message ?? "Something went wrong");
        }
      })
      .finally(() => setLoading(false));
  }, [t]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateTherapistProfile({
        name: f.name,
        phone: f.phone,
        bio: f.bio || "",
        specialty: f.specialty,
        experience: f.experience,
        price: f.price,
        city: f.city,
        gender: f.gender,
        licenseNumber: f.licenseNumber || undefined,
      });
      setProfile((prev) =>
        prev ? { ...prev, ...updated, documents: prev.documents } : updated,
      );
      void refreshSession();
      toast.success(t("therapist_dashboard.profileSaved"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoStatus("error");
      setPhotoError(t("therapist_dashboard.invalidPhotoType"));
      toast.error(t("therapist_dashboard.invalidPhotoType"));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoStatus("error");
      setPhotoError(t("therapist_dashboard.photoTooLarge"));
      toast.error(t("therapist_dashboard.photoTooLarge"));
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
    if (!photoFile || !user) return;
    const therapistId = profile?.id ?? user.id;

    setPhotoStatus("uploading");
    setPhotoProgress(0);

    const formData = new FormData();
    formData.append("file", photoFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/v1/uploads/therapists/${therapistId}/photo`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setPhotoProgress(Math.round((e.loaded / e.total) * 100));
      }
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
            setProfile((prev) => {
              if (!prev) return prev;
              const media = [
                url,
                ...(prev.mediaUrls?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
              ].join(",");
              return { ...prev, photo: url, mediaUrls: media };
            });
            void refreshSession();
            toast.success(t("therapist_dashboard.photoUploadedSuccess"));
          } else {
            setPhotoStatus("error");
            setPhotoError(t("therapist_dashboard.uploadFailed"));
          }
        } catch {
          setPhotoStatus("error");
          setPhotoError(t("therapist_dashboard.uploadFailed"));
        }
      } else {
        setPhotoStatus("error");
        setPhotoError(t("therapist_dashboard.uploadFailed"));
      }
    };

    xhr.onerror = () => {
      setPhotoProgress(0);
      setPhotoStatus("error");
      setPhotoError(t("therapist_dashboard.uploadFailed"));
    };

    xhr.send(formData);
  }

  function removePhoto() {
    const therapistId = profile?.id ?? user?.id;
    if (!therapistId) return;

    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/api/v1/uploads/therapists/${therapistId}/photo`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setPhotoPreview(null);
        setPhotoFile(null);
        setPhotoProgress(0);
        setPhotoStatus("idle");
        setPhotoError("");
        if (photoInputRef.current) photoInputRef.current.value = "";
        setProfile((prev) => {
          if (!prev) return prev;
          const media = (prev.mediaUrls ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(
              (s) => s && !s.split("/").pop()?.split("?")[0].startsWith("photo-"),
            );
          return { ...prev, photo: undefined, mediaUrls: media.join(",") };
        });
        void refreshSession();
        toast.success(t("therapist_dashboard.photoRemoved"));
      } else {
        toast.error(t("therapist_dashboard.uploadFailed"));
      }
    };

    xhr.onerror = () => {
      toast.error(t("therapist_dashboard.uploadFailed"));
    };

    xhr.send();
  }

  function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    for (const file of files) {
      if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        toast.error(t("therapist_dashboard.invalidDocType"));
        return;
      }
      if (file.size > MAX_DOC_SIZE) {
        toast.error(t("therapist_dashboard.docTooLarge"));
        return;
      }
    }

    uploadDocuments(files);
  }

  function uploadDocuments(files: File[]) {
    const therapistId = profile?.id ?? user?.id;
    if (!therapistId) return;

    const formData = new FormData();
    formData.append("documentType", docType);
    for (const file of files) {
      formData.append("files", file);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/v1/uploads/therapists/${therapistId}/documents`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploadProgress(0);
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const uploaded: TherapistProfileDocument[] = res?.documents ?? [];
          setDocs((prev) => [...uploaded, ...prev]);
          toast.success(
            uploaded.length > 1
              ? t("therapist_dashboard.documentsUploaded")
              : t("therapist_dashboard.documentUploaded"),
          );
        } catch {
          toast.error(t("therapist_dashboard.uploadFailed"));
        }
      } else {
        toast.error(t("therapist_dashboard.uploadFailed"));
      }
    };

    xhr.onerror = () => {
      setUploadProgress(0);
      setUploading(false);
      toast.error(t("therapist_dashboard.uploadFailed"));
    };

    setUploading(true);
    setUploadProgress(0);
    xhr.send(formData);
  }

  function getStatusColor(status?: string): string {
    switch (status) {
      case "Verified":
        return "!bg-secondary/10 !text-secondary";
      case "Rejected":
        return "!bg-danger-bg !text-danger-ink";
      case "Pending review":
      default:
        return "!bg-warn-bg !text-warn-ink";
    }
  }

  function getStatusLabel(status?: string): string {
    switch (status) {
      case "Verified":
        return t("therapist_dashboard.verified");
      case "Rejected":
        return t("therapist_dashboard.rejected");
      case "Pending review":
      default:
        return t("therapist_dashboard.pendingReview");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mr-auto grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="h-96 rounded-2xl bg-surface animate-pulse" />
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-surface animate-pulse" />
          <div className="h-72 rounded-2xl bg-surface animate-pulse" />
        </div>
      </div>
    );
  }

  const verifiedCount = docs.filter((d) => d.status === "Verified").length;

  return (
    <form onSubmit={save} className="max-w-5xl mr-auto pb-4">
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
                    {f.name[0] ?? "T"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label={t("therapist_dashboard.uploadPhoto")}
                  className="absolute inset-0 rounded-full bg-black/45 grid place-items-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <h2 className="font-display text-xl font-semibold mt-4 leading-tight break-words">
                {f.name || "—"}
              </h2>

              {f.specialty && (
                <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full bg-text-inverse/10 text-text-inverse ring-1 ring-text-inverse/15 font-mono text-[10px] uppercase tracking-[0.12em]">
                  {f.specialty}
                </span>
              )}

              <p className="text-xs text-text-inverse/75 mt-3 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.email || "—"}</span>
              </p>

              {f.licenseNumber && (
                <p className="font-mono text-[10px] tracking-wider text-text-inverse/70 mt-1.5">
                  {f.licenseNumber}
                </p>
              )}
            </div>

            {/* Live summary — mirrors the fields as you edit them */}
            <dl className="border-t border-text-inverse/10 divide-y divide-text-inverse/10">
              <RailStat
                label={t("therapist_dashboard.yearsExperience")}
                value={`${f.experience || 0}`}
              />
              <RailStat
                label={t("therapist_dashboard.feePerSession")}
                value={`Rs ${Number(f.price || 0).toLocaleString()}`}
              />
              <RailStat label={t("therapist_dashboard.primaryCity")} value={f.city || "—"} />
              <RailStat
                label={t("therapist_dashboard.verifiedDocuments")}
                value={`${verifiedCount}/${docs.length}`}
              />
            </dl>

            {/* Photo controls */}
            <div className="px-6 py-5 border-t border-text-inverse/10 space-y-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-text-inverse text-secondary text-xs font-semibold hover:bg-text-inverse/90 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {photoPreview
                  ? t("therapist_dashboard.replacePhoto")
                  : t("therapist_dashboard.uploadPhoto")}
              </button>

              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-text-inverse/20 text-text-inverse/75 text-xs font-medium hover:bg-danger/25 hover:text-text-inverse hover:border-transparent transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("therapist_dashboard.removePhoto")}
                </button>
              )}

              {photoFile && photoStatus !== "success" && photoStatus !== "uploading" && (
                <button
                  type="button"
                  onClick={uploadPhoto}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:brightness-95 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("therapist_dashboard.savePhoto")}
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
                    {t("therapist_dashboard.uploading")} {photoProgress}%
                  </span>
                </div>
              )}
              {photoStatus === "success" && (
                <span className="text-[10px] text-text-inverse flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  {t("therapist_dashboard.photoUploaded")}
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

        {/* ─────────── Editable content ─────────── */}
        <div className="space-y-6 min-w-0">
          {/* Personal */}
          <section className="card-soft p-6 lg:p-7">
            <SectionHead
              icon={<UserRound className="w-4 h-4" />}
              title={t("therapist_dashboard.sectionPersonal")}
            />
            <div className="space-y-4">
              <Field
                label={t("therapist_dashboard.fullName")}
                value={f.name}
                onChange={(v) => setF({ ...f, name: v })}
              />
              <Field
                label={t("therapist_dashboard.emailLabel")}
                value={f.email}
                onChange={() => {}}
                disabled
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label={t("therapist_dashboard.phone")}
                  value={f.phone}
                  onChange={(v) => setF({ ...f, phone: v })}
                />
                <SelectField
                  label={t("therapist_dashboard.primaryCity")}
                  value={f.city}
                  onChange={(v) => setF({ ...f, city: v })}
                  options={[...CITIES]}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField
                  label={t("therapist_dashboard.genderLabel")}
                  value={f.gender}
                  onChange={(v) => setF({ ...f, gender: v })}
                  options={GENDERS}
                />
              </div>
            </div>
          </section>

          {/* Professional */}
          <section className="card-soft p-6 lg:p-7">
            <SectionHead
              icon={<Stethoscope className="w-4 h-4" />}
              title={t("therapist_dashboard.sectionProfessional")}
            />
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField
                  label={t("therapist_dashboard.specialty")}
                  value={f.specialty}
                  onChange={(v) => setF({ ...f, specialty: v })}
                  options={[...SPECIALTIES]}
                />
                <Field
                  label={t("therapist_dashboard.yearsExperience")}
                  type="number"
                  value={String(f.experience)}
                  onChange={(v) => setF({ ...f, experience: +v })}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label={t("therapist_dashboard.feePerSession")}
                  type="number"
                  value={String(f.price)}
                  onChange={(v) => setF({ ...f, price: +v })}
                />
                <Field
                  label={t("therapist_dashboard.licenseNumber")}
                  placeholder={t("therapist_dashboard.licenseNumberPlaceholder")}
                  value={f.licenseNumber}
                  onChange={(v) => setF({ ...f, licenseNumber: v })}
                />
              </div>
              <label className="block">
                <FieldLabel>{t("therapist_dashboard.bio")}</FieldLabel>
                <textarea
                  value={f.bio}
                  onChange={(e) => setF({ ...f, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell patients about your approach and experience..."
                  className={`${inputCls} resize-y leading-relaxed`}
                />
              </label>
            </div>
          </section>

          {/* Documents */}
          <section className="card-soft p-6 lg:p-7">
            <SectionHead
              icon={<ShieldCheck className="w-4 h-4" />}
              title={t("therapist_dashboard.verifiedDocuments")}
              hint={t("therapist_dashboard.verifiedDocumentsHint")}
            />

            {docs.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl px-4 py-8 text-center bg-background">
                <div className="w-10 h-10 rounded-xl bg-surface grid place-items-center mx-auto">
                  <FileText className="w-5 h-5 text-text-light" />
                </div>
                <p className="text-sm text-text-light mt-3">
                  {t("therapist_dashboard.noDocuments")}
                </p>
              </div>
            ) : (
              <ul className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {docs.map((doc) => (
                  <li key={doc.id} className="p-3.5 bg-white hover:bg-background transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {doc.fileName ?? doc.documentType ?? "Document"}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-text-light truncate mt-0.5">
                          {doc.documentType}
                          {doc.fileSize != null ? ` · ${formatFileSize(doc.fileSize)}` : ""}
                        </p>
                      </div>
                      <span className={`chip shrink-0 ${getStatusColor(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                      {doc.documentUrl && (
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition-colors"
                            title={t("common.view")}
                            aria-label={t("common.view")}
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={doc.documentUrl}
                            download
                            className="p-2 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition-colors"
                            title={t("common.download")}
                            aria-label={t("common.download")}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                    {doc.status === "Rejected" && doc.note && (
                      <div className="mt-2.5 ml-[52px] rounded-lg bg-danger-bg px-3 py-2">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-danger-ink">
                          {t("therapist_dashboard.rejectionReason")}
                        </p>
                        <p className="text-xs text-danger-ink/90 mt-1">{doc.note}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Upload */}
            <div className="mt-4 rounded-xl bg-background border border-border p-3.5">
              <div className="flex items-end gap-2.5 flex-wrap">
                <div className="min-w-[170px] flex-1">
                  <label className="block">
                    <FieldLabel>{t("therapist_dashboard.uploadDocument")}</FieldLabel>
                    <div className="relative">
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                      >
                        {DOC_TYPES.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-text-light absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-outline !py-2.5 !px-4 text-xs disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading
                    ? t("therapist_dashboard.uploading")
                    : t("therapist_dashboard.uploadDocument")}
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocSelect}
                  className="hidden"
                />
              </div>

              {uploading && (
                <div className="mt-3">
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-light mt-1 block">
                    {t("therapist_dashboard.uploading")} {uploadProgress}%
                  </span>
                </div>
              )}

              <p className="text-xs text-text-light mt-3">
                {t("therapist_dashboard.docsReviewHint")}
              </p>
            </div>
          </section>

          {/* Save bar */}
          <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-1 bg-gradient-to-t from-background via-background to-transparent">
            <div className="card-soft flex items-center justify-between gap-4 px-5 py-3.5">
              <p className="text-xs text-text-light hidden sm:block">
                {t("therapist_dashboard.docsReviewHint")}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="btn-secondary disabled:opacity-50 shrink-0"
              >
                {saving ? t("common.submitting") : t("common.saveChanges")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
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

function SectionHead({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-4 mb-5 border-b border-border">
      <span className="w-9 h-9 rounded-xl bg-surface text-secondary grid place-items-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold text-text leading-tight">
          {title}
        </h2>
        {hint && <p className="text-xs text-text-light mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function RailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-inverse/70 min-w-0 truncate">
        {label}
      </dt>
      <dd className="text-sm font-medium text-text-inverse text-right shrink-0 max-w-[55%] truncate">
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputCls} ${disabled ? "!bg-surface !text-text-light !border-transparent cursor-not-allowed" : ""}`}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} appearance-none pr-9 cursor-pointer ${options.includes(value) ? "" : "!text-text-light"}`}
        >
          {!options.includes(value) && value && <option value={value}>{value}</option>}
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-text-light absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </label>
  );
}
