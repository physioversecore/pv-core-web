"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useAdminTherapists } from "@/hooks/useAdminTherapists";
import type { AdminTherapistData, AdminTherapistDocument } from "@/services/api/admin";
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Briefcase,
  DollarSign,
  User,
  FileText,
  ShieldCheck,
  ShieldOff,
  Upload,
  Camera,
  Save,
  X,
  Eye,
  ExternalLink,
} from "lucide-react";

interface TherapistDetailSheetProps {
  therapist: AdminTherapistData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "edit";
  onSave?: (data: Partial<AdminTherapistData>) => Promise<void>;
}

export function TherapistDetailSheet({
  therapist,
  open,
  onOpenChange,
  mode = "view",
  onSave,
}: TherapistDetailSheetProps) {
  const { t } = useLang();
  const { toggleTherapistStatus } = useAdminTherapists({
    search: "",
    specialty: "",
    status: "",
    city: "",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    pageSize: 10,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<AdminTherapistDocument | null>(null);

  const [form, setForm] = useState({
    name: therapist?.name ?? "",
    email: therapist?.email ?? "",
    phone: therapist?.phone ?? "",
    city: therapist?.city ?? "",
    gender: therapist?.gender ?? "",
    specialty: therapist?.specialty ?? "",
    experience: therapist?.experience != null ? String(therapist.experience) : "",
    price: therapist?.price != null ? String(therapist.price) : "",
    bio: therapist?.bio ?? "",
    status: therapist?.status ?? ("Under review" as AdminTherapistData["status"]),
  });

  useEffect(() => {
    if (therapist) {
      setAvatarPreview(null);
      setForm({
        name: therapist.name ?? "",
        email: therapist.email ?? "",
        phone: therapist.phone ?? "",
        city: therapist.city ?? "",
        gender: therapist.gender ?? "",
        specialty: therapist.specialty ?? "",
        experience: therapist.experience != null ? String(therapist.experience) : "",
        price: therapist.price != null ? String(therapist.price) : "",
        bio: therapist.bio ?? "",
        status: therapist.status ?? "Under review",
      });
    }
  }, [therapist]);

  const hasChanges = useMemo(() => {
    if (!therapist) return false;
    return (
      form.name !== (therapist.name ?? "") ||
      form.email !== (therapist.email ?? "") ||
      form.phone !== (therapist.phone ?? "") ||
      form.city !== (therapist.city ?? "") ||
      form.gender !== (therapist.gender ?? "") ||
      form.specialty !== (therapist.specialty ?? "") ||
      form.experience !== (therapist.experience != null ? String(therapist.experience) : "") ||
      form.price !== (therapist.price != null ? String(therapist.price) : "") ||
      form.bio !== (therapist.bio ?? "") ||
      form.status !== (therapist.status ?? "Under review")
    );
  }, [form, therapist]);

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const mediaFiles = therapist?.mediaUrls
    ? therapist.mediaUrls.split(",").filter(Boolean)
    : [];

  const isImage = (url: string) => {
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  const getFileName = (url: string) => {
    const params = new URLSearchParams(url.split("?")[1] || "");
    return params.get("name") || url.split("/").pop()?.split("?")[0] || "file";
  };

  const handleVerify = useCallback(async () => {
    if (!therapist) return;
    try {
      await toggleTherapistStatus(therapist.id, "Verified");
      toast.success(t("admin_dashboard.therapistVerified" as any) ?? "Therapist verified");
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain" as any) ?? "Something went wrong");
    }
  }, [therapist, toggleTherapistStatus, t, onOpenChange]);

  const handleReject = useCallback(async () => {
    if (!therapist) return;
    try {
      await toggleTherapistStatus(therapist.id, "Suspended");
      toast.success(t("admin_dashboard.applicationRejected" as any) ?? "Application rejected");
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain" as any) ?? "Something went wrong");
    }
  }, [therapist, toggleTherapistStatus, t, onOpenChange]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !therapist) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetch(`/api/v1/uploads/therapists/${therapist.id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Files uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, [therapist]);

  const handleSave = useCallback(async () => {
    if (!therapist || !onSave) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        gender: form.gender,
        specialty: form.specialty,
        experience: form.experience ? Number(form.experience) : undefined,
        price: form.price ? Number(form.price) : undefined,
        bio: form.bio,
        status: form.status,
        isActive: form.status === "Verified",
      });
      toast.success(t("common.saved" as any) ?? "Saved");
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain" as any) ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [therapist, onSave, form, t, onOpenChange]);

  if (!therapist) return null;

  const isEdit = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar name={therapist.name} size={56} src={avatarPreview ?? undefined} />
              {isEdit && (
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setAvatarPreview(url);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{therapist.name}</SheetTitle>
              <SheetDescription className="text-xs">
                {therapist.specialty} &middot; {therapist.city}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <Section title={t("admin_dashboard.personalInfo" as any) ?? "Personal Information"}>
            {isEdit ? (
              <>
                <EditField label={t("admin_dashboard.name" as any) ?? "Name"} value={form.name} onChange={(v) => setField("name", v)} />
                <EditField label={t("admin_dashboard.email" as any) ?? "Email"} value={form.email} onChange={(v) => setField("email", v)} type="email" />
                <EditField label={t("admin_dashboard.phone" as any) ?? "Phone"} value={form.phone} onChange={(v) => setField("phone", v)} />
                <EditField label={t("admin_dashboard.city" as any) ?? "City"} value={form.city} onChange={(v) => setField("city", v)} />
                <EditField label={t("admin_dashboard.gender" as any) ?? "Gender"} value={form.gender} onChange={(v) => setField("gender", v)} />
              </>
            ) : (
              <>
                <InfoRow icon={<User size={14} />} label={t("admin_dashboard.name" as any) ?? "Name"} value={therapist.name} />
                <InfoRow icon={<Mail size={14} />} label={t("admin_dashboard.email" as any) ?? "Email"} value={therapist.email ?? "—"} />
                <InfoRow icon={<Phone size={14} />} label={t("admin_dashboard.phone" as any) ?? "Phone"} value={therapist.phone ?? "—"} />
                <InfoRow icon={<MapPin size={14} />} label={t("admin_dashboard.city" as any) ?? "City"} value={therapist.city} />
                <InfoRow icon={<User size={14} />} label={t("admin_dashboard.gender" as any) ?? "Gender"} value={therapist.gender ?? "—"} />
              </>
            )}
          </Section>

          <Section title={t("admin_dashboard.professionalInfo" as any) ?? "Professional Information"}>
            {isEdit ? (
              <>
                <EditField label={t("admin_dashboard.specialty" as any) ?? "Specialty"} value={form.specialty} onChange={(v) => setField("specialty", v)} />
                <EditField label={t("admin_dashboard.experience" as any) ?? "Experience (yrs)"} value={form.experience} onChange={(v) => setField("experience", v)} type="number" />
                <EditField label={t("admin_dashboard.price" as any) ?? "Price (Rs)"} value={form.price} onChange={(v) => setField("price", v)} type="number" />
                <EditField label={t("admin_dashboard.status" as any) ?? "Status"} value={form.status} onChange={(v) => setField("status", v)} type="select" options={["Verified", "Under review", "Suspended"]} />
              </>
            ) : (
              <>
                <InfoRow icon={<Briefcase size={14} />} label={t("admin_dashboard.specialty" as any) ?? "Specialty"} value={therapist.specialty} />
                <InfoRow
                  icon={<Briefcase size={14} />}
                  label={t("admin_dashboard.experience" as any) ?? "Experience"}
                  value={therapist.experience != null ? `${therapist.experience} years` : "—"}
                />
                <InfoRow
                  icon={<DollarSign size={14} />}
                  label={t("admin_dashboard.price" as any) ?? "Price"}
                  value={therapist.price != null ? `Rs ${therapist.price.toLocaleString()}` : "—"}
                />
                <InfoRow icon={<Star size={14} />} label={t("admin_dashboard.rating" as any) ?? "Rating"} value={`${therapist.rating}`} />
                <InfoRow icon={<FileText size={14} />} label={t("admin_dashboard.sessions" as any) ?? "Sessions"} value={`${therapist.sessions}`} />
              </>
            )}
          </Section>

          {isEdit ? (
            <Section title={t("admin_dashboard.bio" as any) ?? "Bio"}>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
                placeholder="Therapist bio..."
              />
            </Section>
          ) : (
            therapist.bio && (
              <Section title={t("admin_dashboard.bio" as any) ?? "Bio"}>
                <p className="text-sm text-text-light whitespace-pre-wrap">{therapist.bio}</p>
              </Section>
            )
          )}

          {!isEdit && (
            <Section title={t("admin_dashboard.status" as any) ?? "Status"}>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    therapist.status === "Verified"
                      ? "default"
                      : therapist.status === "Suspended"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {therapist.status}
                </Badge>
                <span className="text-xs text-text-light">
                  {t("admin_dashboard.joined" as any) ?? "Joined"}: {therapist.joined}
                </span>
              </div>
            </Section>
          )}

          <Section title={t("admin_dashboard.documentsMedia" as any) ?? "Documents & Media"}>
            {(therapist.documents?.length ?? 0) > 0 && (
              <div className="mb-4">
                <p className="text-xs text-text-light mb-2">
                  {t("admin_dashboard.applicationDocuments" as any) ?? "Application documents"}
                </p>
                <div className="space-y-2">
                  {therapist.documents!.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-border rounded-md p-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-text-light shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">
                              {doc.fileName ?? doc.documentType ?? "Document"}
                            </p>
                            <p className="text-[10px] text-text-light truncate">
                              {doc.documentType}
                              {doc.fileSize != null
                                ? ` · ${formatFileSize(doc.fileSize)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.status && (
                            <Badge
                              variant={
                                doc.status === "Verified"
                                  ? "default"
                                  : doc.status === "Rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {doc.status}
                            </Badge>
                          )}
                          {doc.documentUrl && (
                            <>
                              <button
                                onClick={() => setViewerDoc(doc)}
                                className="inline-flex items-center gap-1 text-xs text-secondary hover:underline cursor-pointer"
                              >
                                <Eye size={12} /> View
                              </button>
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-text-light hover:text-secondary hover:underline"
                              >
                                <ExternalLink size={12} /> Open
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      {doc.note && (
                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5">
                          <p className="text-[10px] uppercase font-mono text-red-600">
                            Rejection reason
                          </p>
                          <p className="text-xs text-text mt-0.5">{doc.note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-light">
                {mediaFiles.length} {t("admin_dashboard.fileCount" as any) ?? "file(s)"}
              </span>
              <label className="btn-outline !py-1 !px-3 text-xs cursor-pointer inline-flex items-center gap-1">
                <Upload size={12} />
                {uploading ? (t("admin_dashboard.uploading" as any) ?? "Uploading...") : (t("common.upload" as any) ?? "Upload")}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            </div>
            {mediaFiles.length === 0 ? (
              <p className="text-xs text-text-light py-4 text-center border border-dashed rounded-md">
                {t("admin_dashboard.noFiles" as any) ?? "No files uploaded yet"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((url, i) => (
                  <div key={i} className="relative group border rounded-md overflow-hidden">
                    {isImage(url) ? (
                      <img
                        src={url}
                        alt={getFileName(url)}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 flex items-center justify-center bg-surface/50">
                        <FileText size={24} className="text-text-light" />
                      </div>
                    )}
                    <div className="p-1.5">
                      <p className="text-[10px] text-text-light truncate">{getFileName(url)}</p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                        View
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {isEdit ? (
            <div className="flex gap-2 pt-2 pb-4">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            therapist.status === "Under review" && (
              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={handleVerify}
                  className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  Verify
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white cursor-pointer"
                >
                  <ShieldOff size={14} />
                  Reject
                </button>
              </div>
            )
          )}
        </div>
      </SheetContent>

      {viewerDoc && (
        <DocumentViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      )}
    </Sheet>
  );
}

function isImageUrl(url: string): boolean {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
}

function DocumentViewer({
  doc,
  onClose,
}: {
  doc: AdminTherapistDocument;
  onClose: () => void;
}) {
  const url = doc.documentUrl;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {doc.fileName ?? doc.documentType ?? "Document"}
          </DialogTitle>
          <DialogDescription>{doc.documentType}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 max-h-[70vh] overflow-auto rounded-lg border border-border bg-white">
          {url ? (
            isImageUrl(url) ? (
              <img
                src={url}
                alt={doc.fileName ?? "Document"}
                className="w-full object-contain"
              />
            ) : (
              <iframe
                src={url}
                title={doc.fileName ?? "Document"}
                className="w-full h-[65vh]"
              />
            )
          ) : (
            <p className="p-6 text-center text-sm text-text-light">
              No preview available
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1"
            >
              <ExternalLink size={12} /> Open in new tab
            </a>
          )}
          <button
            onClick={onClose}
            className="btn-secondary !py-1.5 !px-3 text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {  return (
    <div>
      <h4 className="text-xs font-mono uppercase text-text-light mb-2">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-text-light">{icon}</span>
      <span className="text-text-light w-24 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "number" | "select";
  options?: string[];
}) {
  if (type === "select" && options) {
    return (
      <div>
        <label className="text-xs font-mono text-text-light uppercase">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-mono text-text-light uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
      />
    </div>
  );
}
