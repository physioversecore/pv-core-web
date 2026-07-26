"use client";

import { useRef, useState, useEffect } from "react";
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
  X,
  RefreshCw,
} from "lucide-react";
import { getTherapistProfile, updateTherapistProfile } from "@/services/api/profile";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_DOC_SIZE = 5 * 1024 * 1024;
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const DOC_TYPES = [
  { key: "nmc", label: "NMC License" },
  { key: "degree", label: "Degree Certificate" },
  { key: "id", label: "ID Proof" },
  { key: "other", label: "Other Certification" },
] as const;

type DocKey = (typeof DOC_TYPES)[number]["key"];

interface DocEntry {
  file: File | null;
  preview: string;
  name: string;
  uploadedAt: string;
  status: "Uploaded" | "Pending Verification";
  progress: number;
  error: string;
}

export default function TProfile() {
  const { t } = useLang();
  const { user } = useAuth();

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRefs = useRef<Record<DocKey, HTMLInputElement | null>>({
    nmc: null,
    degree: null,
    id: null,
    other: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: "",
    specialty: user?.specialty ?? "General",
    experience: 5,
    price: 1200,
    city: user?.city ?? "Kathmandu",
    gender: "Male",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [photoStatus, setPhotoStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [photoError, setPhotoError] = useState("");

  const [documents, setDocuments] = useState<Record<DocKey, DocEntry>>({
    nmc: { file: null, preview: "", name: "", uploadedAt: "", status: "Pending Verification", progress: 0, error: "" },
    degree: { file: null, preview: "", name: "", uploadedAt: "", status: "Pending Verification", progress: 0, error: "" },
    id: { file: null, preview: "", name: "", uploadedAt: "", status: "Pending Verification", progress: 0, error: "" },
    other: { file: null, preview: "", name: "", uploadedAt: "", status: "Pending Verification", progress: 0, error: "" },
  });

  useEffect(() => {
    getTherapistProfile()
      .then((profile) => {
        setF({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio ?? "",
          specialty: profile.specialty,
          experience: profile.experience,
          price: profile.price,
          city: profile.city,
          gender: profile.gender,
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
      await updateTherapistProfile({
        name: f.name,
        phone: f.phone,
        bio: f.bio || "",
        specialty: f.specialty,
        experience: f.experience,
        price: f.price,
        city: f.city,
        gender: f.gender,
      });
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
      setPhotoError("Only JPG, PNG, and WEBP are allowed.");
      setPhotoStatus("error");
      toast.error("Invalid file type. Please select JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("File exceeds 5 MB limit.");
      setPhotoStatus("error");
      toast.error("File too large. Maximum size is 5 MB.");
      return;
    }

    setPhotoFile(file);
    setPhotoError("");
    setPhotoStatus("idle");

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function simulatePhotoUpload() {
    if (!photoFile) return;
    setPhotoStatus("uploading");
    setPhotoProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setPhotoProgress(100);
        setPhotoStatus("success");
        toast.success("Profile photo uploaded successfully!");
      } else {
        setPhotoProgress(Math.round(progress));
      }
    }, 300);
  }

  function removePhoto() {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoProgress(0);
    setPhotoStatus("idle");
    setPhotoError("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handleDocSelect(key: DocKey, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG are allowed.");
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      toast.error("File too large. Maximum size is 5 MB.");
      return;
    }

    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    const now = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    setDocuments((prev) => ({
      ...prev,
      [key]: {
        file,
        preview,
        name: file.name,
        uploadedAt: now,
        status: "Pending Verification",
        progress: 0,
        error: "",
      },
    }));

    simulateDocUpload(key);
  }

  function simulateDocUpload(key: DocKey) {
    setDocuments((prev) => ({
      ...prev,
      [key]: { ...prev[key], progress: 0 },
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDocuments((prev) => ({
          ...prev,
          [key]: { ...prev[key], progress: 100, status: "Uploaded" },
        }));
        toast.success(`${DOC_TYPES.find((d) => d.key === key)?.label} uploaded!`);
      } else {
        setDocuments((prev) => ({
          ...prev,
          [key]: { ...prev[key], progress: Math.round(progress) },
        }));
      }
    }, 300);
  }

  function removeDoc(key: DocKey) {
    setDocuments((prev) => ({
      ...prev,
      [key]: { file: null, preview: "", name: "", uploadedAt: "", status: "Pending Verification", progress: 0, error: "" },
    }));
    if (docInputRefs.current[key]) docInputRefs.current[key]!.value = "";
  }

  function handleDocDownload(key: DocKey) {
    const doc = documents[key];
    if (!doc.file) return;
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="p-6 text-text-light">{t("common.loading")}</div>;
  }

  return (
    <form onSubmit={save} className="card-soft p-6 max-w-2xl space-y-6">
      {/* ─── Photo Upload ─── */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-text-light">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          <div className="relative group">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
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

          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {photoPreview ? "Replace Photo" : "Upload Photo"}
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5 !border-danger !text-danger hover:!bg-danger/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            {photoStatus === "uploading" && (
              <div className="w-48">
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${photoProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-light mt-0.5 block">
                  Uploading… {photoProgress}%
                </span>
              </div>
            )}
            {photoStatus === "success" && (
              <span className="text-[10px] text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Uploaded successfully
              </span>
            )}
            {photoStatus === "error" && (
              <span className="text-[10px] text-danger">{photoError}</span>
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

        {photoFile && photoStatus !== "success" && photoStatus !== "uploading" && (
          <button
            type="button"
            onClick={simulatePhotoUpload}
            className="btn-secondary !py-1.5 !px-4 text-xs mt-1"
          >
            Save Photo
          </button>
        )}
      </div>

      {/* ─── Personal Fields ─── */}
      <Field
        label={t("therapist_dashboard.fullName")}
        value={f.name}
        onChange={(v) => setF({ ...f, name: v })}
      />
      <Field
        label={t("therapist_dashboard.phone")}
        value={f.phone}
        onChange={(v) => setF({ ...f, phone: v })}
      />
      <div>
        <label className="text-xs font-medium text-text-light">
          {t("therapist_dashboard.bio")}
        </label>
        <textarea
          value={f.bio}
          onChange={(e) => setF({ ...f, bio: e.target.value })}
          rows={3}
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
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
        <SelectField
          label={t("therapist_dashboard.primaryCity")}
          value={f.city}
          onChange={(v) => setF({ ...f, city: v })}
          options={[...CITIES]}
        />
      </div>

      <div className="p-3 rounded-xl bg-surface/60 text-xs text-text-light">
        {t("therapist_dashboard.nmcLicense")}{" "}
        <span className="font-mono text-secondary">NMC-PT-2018-XXXX</span> ·{" "}
        <span className="chip !bg-secondary !text-white">
          {t("therapist_dashboard.verified")}
        </span>
      </div>

      {/* ─── Document Upload Section ─── */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div>
          <h3 className="font-display text-base font-semibold text-text">
            Upload Important Documents
          </h3>
          <p className="text-xs text-text-light mt-0.5">
            PDF, JPG, or PNG — max 5 MB per file
          </p>
        </div>

        <div className="space-y-3">
          {DOC_TYPES.map(({ key, label }) => {
            const doc = documents[key];
            const hasFile = !!doc.name;
            return (
              <div
                key={key}
                className="border border-border rounded-xl p-3 bg-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">
                    {label}
                  </span>
                  {hasFile && (
                    <span
                      className={`chip text-[10px] ${
                        doc.status === "Uploaded"
                          ? "!bg-success/10 !text-success"
                          : "!bg-warning/10 !text-warning"
                      }`}
                    >
                      {doc.status}
                    </span>
                  )}
                </div>

                {!hasFile ? (
                  <button
                    type="button"
                    onClick={() => docInputRefs.current[key]?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg py-3 flex flex-col items-center gap-1 text-text-light hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[11px]">Click to upload {label}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    {doc.preview ? (
                      <img
                        src={doc.preview}
                        alt={doc.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-surface grid place-items-center shrink-0">
                        <FileText className="w-5 h-5 text-text-light" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{doc.name}</p>
                      <p className="text-[10px] text-text-light">
                        {doc.uploadedAt}
                      </p>
                      {doc.progress > 0 && doc.progress < 100 && (
                        <div className="h-1 bg-surface rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.preview && (
                        <button
                          type="button"
                          onClick={() => {
                            const w = window.open();
                            if (w) {
                              w.document.write(
                                `<img src="${doc.preview}" style="max-width:100%;height:auto;" />`
                              );
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-primary transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDocDownload(key)}
                        className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-primary transition-colors"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => docInputRefs.current[key]?.click()}
                        className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition-colors"
                        title="Replace"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc(key)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-light hover:text-danger transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={(el) => { docInputRefs.current[key] = el; }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleDocSelect(key, e)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-secondary disabled:opacity-50">
        {saving ? t("common.submitting") : t("common.saveChanges")}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
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
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
