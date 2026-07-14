"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import {
  Paperclip, X, FileText, Image, Video, File, Loader2,
  CheckCircle2, Eye,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { createReport, getMyPatients } from "@/services/api/reports";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const REPORT_TYPES = ["Session note", "Progress report", "X-ray / Image", "Exercise video"];
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.doc,.docx,.webm";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string, size: number = 16) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText size={size} />;
  if (["jpg", "jpeg", "png", "gif"].includes(ext ?? "")) return <Image size={size} />;
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? "")) return <Video size={size} />;
  return <File size={size} />;
}

function getFileTypeLabel(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "PDF",
    jpg: "Image", jpeg: "Image", png: "Image", gif: "Image",
    mp4: "Video", mov: "Video", avi: "Video", webm: "Video",
    doc: "Document", docx: "Document",
  };
  return map[ext ?? ""] ?? "File";
}

function getFileTint(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "bg-secondary/10 text-secondary";
  if (["jpg", "jpeg", "png", "gif"].includes(ext ?? "")) return "bg-primary/10 text-primary";
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? "")) return "bg-amber/10 text-amber";
  return "bg-surface text-text-light";
}

function isImage(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext ?? "");
}

function isVideo(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "avi", "webm"].includes(ext ?? "");
}

function isPdf(name: string) {
  return name.split(".").pop()?.toLowerCase() === "pdf";
}

export function UploadReport() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patientId, setPatientId] = useState("");
  const [kind, setKind] = useState(REPORT_TYPES[0]);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["my-patients"],
    queryFn: () => getMyPatients(),
  });

  const patients = useMemo(() => patientsData ?? [], [patientsData]);

  const mutation = useMutation({
    mutationFn: async (data: { patientId: string; title: string; content: string; files: File[] }) => {
      const fileUrls: string[] = [];
      for (const f of data.files) {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch(`/api/uploads/${data.patientId}`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.detail ?? `Upload failed (${res.status})`);
        }
        const result = await res.json();
        fileUrls.push(result.url);
      }
      return createReport({
        patientId: data.patientId,
        title: data.title,
        content: data.content,
        fileUrl: fileUrls.length === 1 ? fileUrls[0] : fileUrls.join(","),
      });
    },
    onSuccess: () => {
      toast.success(t("therapist_dashboard.reportUploaded"));
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["therapist-dashboard"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload report");
    },
  });

  useEffect(() => {
    if (uploadSuccess) {
      setNote("");
      setFiles([]);
      setPatientId("");
      setKind(REPORT_TYPES[0]);
      const timer = setTimeout(() => {
        setUploadSuccess(false);
        mutation.reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files;
    if (!picked) return;
    setFiles((prev) => [...prev, ...Array.from(picked)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const openPreview = (f: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewFile(f);
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const submit = () => {
    if (!patientId) return toast.error(t("therapist_dashboard.errorPickPatient"));
    if (!note.trim()) return toast.error("Please add a progress note");
    if (mutation.isPending) return;
    mutation.mutate({ patientId, title: kind, content: note, files });
  };

  const isPending = mutation.isPending;
  const isSuccess = uploadSuccess;

  return (
    <section className="card-soft p-6 mb-6">
      <div className="flex items-start justify-between mb-1 gap-3">
        <h3 className="font-display text-xl">{t("therapist_dashboard.uploadSessionReport")}</h3>
        <span className="chip">{t("therapist_dashboard.afterEveryVisit")}</span>
      </div>
      <p className="text-sm text-text-light mb-5">{t("therapist_dashboard.uploadDesc")}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Left — form fields + submit */}
        <div className="space-y-4">
          <div>
            <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.patientLabel")}</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              disabled={isPending || patientsLoading}
            >
              <option value="">
                {patientsLoading ? "Loading patients…" : t("therapist_dashboard.selectPatient")}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.reportType")}</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              disabled={isPending}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.progressNote")}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder={t("therapist_dashboard.notePlaceholder")}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm resize-none"
              disabled={isPending}
            />
          </div>

          <button
            onClick={submit}
            disabled={isPending || isSuccess || !patientId || !note.trim()}
            className="btn-secondary !px-6 w-full disabled:opacity-50"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t("common.upload")}…
              </span>
            ) : isSuccess ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} />
                {t("therapist_dashboard.reportUploaded")}
              </span>
            ) : (
              t("therapist_dashboard.uploadNotify")
            )}
          </button>
        </div>

        {/* Right — attach file + file pills */}
        <div className="space-y-3">
          <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.attachFile")}</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="w-full py-8 rounded-xl border-2 border-dashed text-sm transition cursor-pointer flex flex-col items-center justify-center gap-2
              border-border text-text-light hover:border-secondary hover:bg-surface/20
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip size={20} />
            <span className="font-medium">
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected — click to add more`
                : t("therapist_dashboard.attachFile")}
            </span>
          </button>
          <div className="flex flex-wrap gap-2">
            {files.map((f, idx) => (
              <div
                key={`${f.name}-${idx}`}
                className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg border border-border bg-surface/40"
              >
                <span className={`w-5 h-5 rounded grid place-items-center shrink-0 ${getFileTint(f.name)}`}>
                  {getFileIcon(f.name, 11)}
                </span>
                <span className="text-[11px] font-medium leading-none truncate max-w-[100px]">{f.name}</span>
                {(isImage(f.name) || isVideo(f.name) || isPdf(f.name)) && (
                  <button
                    type="button"
                    onClick={() => openPreview(f)}
                    className="p-0.5 rounded hover:bg-surface text-text-light hover:text-secondary transition shrink-0"
                    title="Preview"
                  >
                    <Eye size={11} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  disabled={isPending}
                  className="p-0.5 rounded hover:bg-danger/10 text-text-light hover:text-danger transition shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen preview dialog */}
      <Dialog open={previewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl !flex !flex-col !justify-start">
          <DialogTitle className="sr-only">{previewFile?.name}</DialogTitle>
          <DialogDescription className="sr-only">Preview of {previewFile?.name}</DialogDescription>

          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-background">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary grid place-items-center shrink-0">
                {previewFile && getFileIcon(previewFile.name)}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{previewFile?.name}</div>
                <div className="text-xs text-text-light">
                  {previewFile && getFileTypeLabel(previewFile.name)} · {previewFile && formatFileSize(previewFile.size)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative bg-black/5">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {previewFile?.type.startsWith("image/") && previewUrl && (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
                />
              )}
              {previewFile?.type.startsWith("video/") && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  muted
                  className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl"
                />
              )}
              {previewFile?.type === "application/pdf" && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                  title={previewFile.name}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
