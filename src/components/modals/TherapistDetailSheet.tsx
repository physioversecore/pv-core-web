"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
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
  Loader2,
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
  const { approveTherapist, rejectTherapist } = useAdminTherapists({
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
  const [docs, setDocs] = useState<AdminTherapistDocument[]>(therapist?.documents ?? []);
  const [docType, setDocType] = useState("Additional document");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
      setDocs(therapist.documents ?? []);
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
    setVerifying(true);
    try {
      await approveTherapist(therapist.id);
      toast.success(t("admin_dashboard.therapistVerified"));
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain"));
    } finally {
      setVerifying(false);
    }
  }, [therapist, approveTherapist, t, onOpenChange]);

  const confirmReject = useCallback(async () => {
    if (!therapist) return;
    if (!rejectNote.trim()) {
      toast.error(t("admin_dashboard.reasonRequired"));
      return;
    }
    setRejecting(true);
    try {
      await rejectTherapist(therapist.id, rejectNote.trim());
      toast.success(t("admin_dashboard.applicationRejected"));
      setRejectOpen(false);
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain"));
    } finally {
      setRejecting(false);
    }
  }, [therapist, rejectNote, rejectTherapist, t, onOpenChange]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !therapist) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("documentType", docType);
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetch(`/api/v1/uploads/therapists/${therapist.id}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail ?? "Upload failed");
      const uploaded: AdminTherapistDocument[] = data?.documents ?? [];
      setDocs((prev) => [...uploaded, ...prev]);
      toast.success(
        uploaded.length > 1
          ? t("admin_dashboard.documentsUploaded")
          : t("admin_dashboard.documentUploaded"),
      );
    } catch {
      toast.error(t("admin_dashboard.uploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [therapist, docType, t]);

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
      toast.success(t("common.saved"));
      onOpenChange(false);
    } catch {
      toast.error(t("common.tryAgain"));
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
              <Avatar name={therapist.name} size={56} src={avatarPreview ?? therapist.mediaUrls?.split(",")[0]} />
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
          <Section title={t("admin_dashboard.personalInfo")}>
            {isEdit ? (
              <>
                <EditField label={t("admin_dashboard.name")} value={form.name} onChange={(v) => setField("name", v)} />
                <EditField label={t("admin_dashboard.email")} value={form.email} onChange={(v) => setField("email", v)} type="email" />
                <EditField label={t("admin_dashboard.phone")} value={form.phone} onChange={(v) => setField("phone", v)} />
                <EditField label={t("admin_dashboard.city")} value={form.city} onChange={(v) => setField("city", v)} />
                <EditField label={t("admin_dashboard.gender")} value={form.gender} onChange={(v) => setField("gender", v)} />
              </>
            ) : (
              <>
                <InfoRow icon={<User size={14} />} label={t("admin_dashboard.name")} value={therapist.name} />
                <InfoRow icon={<Mail size={14} />} label={t("admin_dashboard.email")} value={therapist.email ?? "—"} />
                <InfoRow icon={<Phone size={14} />} label={t("admin_dashboard.phone")} value={therapist.phone ?? "—"} />
                <InfoRow icon={<MapPin size={14} />} label={t("admin_dashboard.city")} value={therapist.city} />
                <InfoRow icon={<User size={14} />} label={t("admin_dashboard.gender")} value={therapist.gender ?? "—"} />
              </>
            )}
          </Section>

          <Section title={t("admin_dashboard.professionalInfo")}>
            {isEdit ? (
              <>
                <EditField label={t("admin_dashboard.specialty")} value={form.specialty} onChange={(v) => setField("specialty", v)} />
                <EditField label={t("admin_dashboard.experience")} value={form.experience} onChange={(v) => setField("experience", v)} type="number" />
                <EditField label={t("admin_dashboard.price")} value={form.price} onChange={(v) => setField("price", v)} type="number" />
                <EditField label={t("admin_dashboard.status")} value={form.status} onChange={(v) => setField("status", v)} type="select" options={["Verified", "Under review", "Suspended"]} />
              </>
            ) : (
              <>
                <InfoRow icon={<Briefcase size={14} />} label={t("admin_dashboard.specialty")} value={therapist.specialty} />
                <InfoRow
                  icon={<Briefcase size={14} />}
                  label={t("admin_dashboard.experience")}
                  value={therapist.experience != null ? `${therapist.experience} years` : "—"}
                />
                <InfoRow
                  icon={<DollarSign size={14} />}
                  label={t("admin_dashboard.price")}
                  value={therapist.price != null ? `Rs ${therapist.price.toLocaleString()}` : "—"}
                />
                <InfoRow icon={<Star size={14} />} label={t("admin_dashboard.rating")} value={`${therapist.rating}`} />
                <InfoRow icon={<FileText size={14} />} label={t("admin_dashboard.sessions")} value={`${therapist.sessions}`} />
              </>
            )}
          </Section>

          {isEdit ? (
            <Section title={t("admin_dashboard.bio")}>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
                placeholder={t("admin_dashboard.bioPlaceholder")}
              />
            </Section>
          ) : (
            therapist.bio && (
              <Section title={t("admin_dashboard.bio")}>
                <p className="text-sm text-text-light whitespace-pre-wrap">{therapist.bio}</p>
              </Section>
            )
          )}

          {!isEdit && (
            <Section title={t("admin_dashboard.status")}>
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
                  {t("admin_dashboard.joined")}: {therapist.joined}
                </span>
              </div>
            </Section>
          )}

          <Section title={t("admin_dashboard.documentsMedia")}>
            {docs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-text-light mb-2">
                  {t("admin_dashboard.applicationDocuments")}
                </p>
                <div className="space-y-2">
                  {docs.map((doc) => (
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
                                <Eye size={12} /> {t("admin_dashboard.viewFile")}
                              </button>
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-text-light hover:text-secondary hover:underline"
                              >
                                <ExternalLink size={12} /> {t("admin_dashboard.openFile")}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      {doc.note && (
                        <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5">
                          <p className="text-[10px] uppercase font-mono text-red-600">
                            {t("admin_dashboard.rejectionReason")}
                          </p>
                          <p className="text-xs text-text mt-0.5">{doc.note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="text-xs text-text-light">
                {docs.length} {t("admin_dashboard.docCount")}
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="h-8 px-2 rounded-md border border-input bg-transparent text-xs"
                  title={t("admin_dashboard.documentType")}
                >
                  <option value="NMC License">NMC License</option>
                  <option value="Degree Certificate">Degree Certificate</option>
                  <option value="ID Proof">ID Proof</option>
                  <option value="Certification">Certification</option>
                  <option value="Additional document">Additional document</option>
                </select>
                <label className="btn-outline !py-1 !px-3 text-xs cursor-pointer inline-flex items-center gap-1">
                  <Upload size={12} />
                  {uploading ? t("admin_dashboard.uploading") : t("common.upload")}
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                    accept="image/*,.pdf"
                  />
                </label>
              </div>
            </div>
            {mediaFiles.length === 0 ? (
              <p className="text-xs text-text-light py-4 text-center border border-dashed rounded-md">
                {t("admin_dashboard.noFiles")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((url, i) => (
                  <div key={i} className="relative group border rounded-md overflow-hidden">
                    {isImage(url) ? (
                      <Image
                        src={url}
                        alt={getFileName(url)}
                        width={400}
                        height={200}
                        unoptimized
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
                        {t("admin_dashboard.viewFile")}
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
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? t("admin_dashboard.saving") : t("common.save")}
              </button>
            </div>
          ) : (
            therapist.status === "Under review" && (
              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  {verifying ? t("admin_dashboard.verifying") : t("common.verify")}
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={verifying}
                  className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white cursor-pointer disabled:opacity-50"
                >
                  <ShieldOff size={14} />
                  {t("admin_dashboard.reject")}
                </button>
              </div>
            )
          )}
        </div>
      </SheetContent>

      {viewerDoc && (
        <DocumentViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {t("admin_dashboard.rejectApplication")}
            </DialogTitle>
            <DialogDescription>
              {t("admin_dashboard.rejectReasonHint")}
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            autoFocus
            placeholder={t("admin_dashboard.rejectReasonPlaceholder")}
            className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
          />
          {rejectNote.trim() && (
            <p className="text-[10px] text-text-light -mt-2">
              {t("admin_dashboard.reasonShared")}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setRejectOpen(false)}
              className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={confirmReject}
              disabled={rejecting || !rejectNote.trim()}
              className="btn-outline !py-1.5 !px-3 text-xs !text-red-500 !border-red-500 hover:!bg-red-500 hover:!text-white cursor-pointer disabled:opacity-50"
            >
              {rejecting ? t("admin_dashboard.rejecting") : t("admin_dashboard.confirmReject")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
  const { t } = useLang();
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
              <Image
                src={url}
                alt={doc.fileName ?? "Document"}
                width={800}
                height={600}
                unoptimized
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
              {t("admin_dashboard.noPreview")}
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
              <ExternalLink size={12} /> {t("admin_dashboard.openInNewTab")}
            </a>
          )}
          <button
            onClick={onClose}
            className="btn-secondary !py-1.5 !px-3 text-xs cursor-pointer"
          >
            {t("common.close")}
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
