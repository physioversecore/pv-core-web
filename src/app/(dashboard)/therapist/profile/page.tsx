"use client";

import { useRef, useState, useEffect } from "react";
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
        return "!bg-success/10 !text-success";
      case "Rejected":
        return "!bg-danger/10 !text-danger";
      case "Pending review":
      default:
        return "!bg-warning/10 !text-warning";
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
    return <div className="p-6 text-text-light">{t("common.loading")}</div>;
  }

  return (
    <form onSubmit={save} className="card-soft p-6 max-w-2xl space-y-8">
      {/* ─── Header: Photo + identity ─── */}
      <div className="flex items-start gap-4 pb-2">
        <div className="relative group shrink-0">
          {photoPreview ? (
            <Image
              src={photoPreview}
              alt="Profile"
              width={80}
              height={80}
              unoptimized
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface grid place-items-center text-secondary font-display text-2xl">
              {f.name[0] ?? "T"}
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

        <div className="flex-1 min-w-0 pt-1">
          <h2 className="font-display text-lg font-semibold text-text truncate">
            {f.name || "—"}
          </h2>
          <p className="text-xs text-text-light mt-0.5 flex items-center gap-1.5">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{f.email || "—"}</span>
          </p>
          {f.licenseNumber && (
            <p className="text-[10px] font-mono text-text-light mt-1">
              {f.licenseNumber}
            </p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {photoPreview ? t("therapist_dashboard.replacePhoto") : t("therapist_dashboard.uploadPhoto")}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 !border-danger !text-danger hover:!bg-danger/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t("therapist_dashboard.removePhoto")}
              </button>
            )}
          </div>

          {photoStatus === "uploading" && (
            <div className="w-48 mt-1.5">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${photoProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-text-light mt-0.5 block">
                {t("therapist_dashboard.uploading")} {photoProgress}%
              </span>
            </div>
          )}
          {photoStatus === "success" && (
            <span className="text-[10px] text-success flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> {t("therapist_dashboard.photoUploaded")}
            </span>
          )}
          {photoStatus === "error" && (
            <span className="text-[10px] text-danger mt-1 block">{photoError}</span>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {photoFile && photoStatus !== "success" && photoStatus !== "uploading" && (
            <button
              type="button"
              onClick={uploadPhoto}
              className="btn-secondary !py-1.5 !px-4 text-xs mt-1.5"
            >
              {t("therapist_dashboard.savePhoto")}
            </button>
          )}
        </div>
      </div>

      {/* ─── Section: Personal ─── */}
      <section className="space-y-4">
        <SectionTitle title={t("therapist_dashboard.sectionPersonal")} />
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
        <SelectField
          label={t("therapist_dashboard.genderLabel")}
          value={f.gender}
          onChange={(v) => setF({ ...f, gender: v })}
          options={GENDERS}
        />
      </section>

      {/* ─── Section: Professional ─── */}
      <section className="space-y-4">
        <SectionTitle title={t("therapist_dashboard.sectionProfessional")} />
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
        <div>
          <label className="text-xs font-medium text-text-light">
            {t("therapist_dashboard.bio")}
          </label>
          <textarea
            value={f.bio}
            onChange={(e) => setF({ ...f, bio: e.target.value })}
            rows={4}
            placeholder="Tell patients about your approach and experience..."
            className={`${inputCls} resize-y`}
          />
        </div>
      </section>

      {/* ─── Section: Documents ─── */}
      <section className="space-y-3 pt-2 border-t border-border">
        <div>
          <SectionTitle title={t("therapist_dashboard.verifiedDocuments")} />
          <p className="text-xs text-text-light -mt-1">
            {t("therapist_dashboard.verifiedDocumentsHint")}
          </p>
        </div>

        {/* Existing / uploaded documents */}
        {docs.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-text-light mx-auto" />
            <p className="text-xs text-text-light mt-2">
              {t("therapist_dashboard.noDocuments")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="border border-border rounded-xl p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface grid place-items-center shrink-0">
                    <FileText className="w-5 h-5 text-text-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {doc.fileName ?? doc.documentType ?? "Document"}
                    </p>
                    <p className="text-[10px] text-text-light truncate">
                      {doc.documentType}
                      {doc.fileSize != null ? ` · ${formatFileSize(doc.fileSize)}` : ""}
                    </p>
                  </div>
                  <span className={`chip text-[10px] ${getStatusColor(doc.status)}`}>
                    {getStatusLabel(doc.status)}
                  </span>
                  {doc.documentUrl && (
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-primary transition-colors"
                        title={t("common.view")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={doc.documentUrl}
                        download
                        className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-primary transition-colors"
                        title={t("common.download")}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
                {doc.status === "Rejected" && doc.note && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
                    <p className="text-[10px] uppercase font-mono text-red-600">
                      {t("therapist_dashboard.rejectionReason")}
                    </p>
                    <p className="text-xs text-text mt-0.5">{doc.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload new document */}
        <div className="border border-border rounded-xl p-3 bg-white space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white text-xs"
            >
              {DOC_TYPES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? t("therapist_dashboard.uploading") : t("therapist_dashboard.uploadDocument")}
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
            <div className="w-full">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-text-light mt-0.5 block">
                {t("therapist_dashboard.uploading")} {uploadProgress}%
              </span>
            </div>
          )}
          <p className="text-[10px] text-text-light">
            {t("therapist_dashboard.docsReviewHint")}
          </p>
        </div>
      </section>

      <button type="submit" disabled={saving} className="btn-secondary disabled:opacity-50">
        {saving ? t("common.submitting") : t("common.saveChanges")}
      </button>
    </form>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="font-display text-base font-semibold text-text">{title}</h3>
  );
}

const inputCls =
  "w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary";

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
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputCls} ${disabled ? "!bg-surface !text-text-light cursor-not-allowed" : ""}`}
      />
    </div>
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
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${options.includes(value) ? "" : "!text-text-light"}`}
      >
        {!options.includes(value) && value && <option value={value}>{value}</option>}
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
