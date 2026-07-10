"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Paperclip, X, FileText, Image, Video, File, Loader2, CheckCircle2, ZoomIn, Expand, Play, Maximize2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { createReport, uploadFile, getMyPatients } from "@/services/api/reports";
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

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText size={18} />;
  if (["jpg", "jpeg", "png", "gif"].includes(ext ?? "")) return <Image size={18} />;
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? "")) return <Video size={18} />;
  return <File size={18} />;
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

export function UploadReport() {
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patientId, setPatientId] = useState("");
  const [kind, setKind] = useState(REPORT_TYPES[0]);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Generate preview URL when file changes
  useEffect(() => {
    let url: string | null = null;
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf")) {
      url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);


  // Fetch real patients list
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["my-patients"],
    queryFn: () => getMyPatients(),
  });

  const patients = useMemo(() => patientsData ?? [], [patientsData]);

  // Two-step mutation: upload file → create report
  const mutation = useMutation({
    mutationFn: async (data: { patientId: string; title: string; content: string; file: File | null }) => {
      let fileUrl: string | undefined;

      // Step 1: Upload the file if one is selected
      if (data.file) {
        const uploadResult = await uploadFile(data.file);
        fileUrl = uploadResult.url;
      }

      // Step 2: Create the report with the file URL
      return createReport({
        patientId: data.patientId,
        title: data.title,
        content: data.content,
        fileUrl,
      });
    },
    onSuccess: () => {
      toast.success(t("therapist_dashboard.reportUploaded"));
      setNote("");
      setFile(null);
      setPatientId("");
      setKind(REPORT_TYPES[0]);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload report");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = () => {
    if (!patientId) return toast.error(t("therapist_dashboard.errorPickPatient"));
    if (!note.trim()) return toast.error("Please add a progress note");
    if (mutation.isPending) return;

    mutation.mutate({ patientId, title: kind, content: note, file });
  };

  const isPending = mutation.isPending;
  const isSuccess = mutation.isSuccess;

  return (
    <section className="card-soft p-6 mb-6">
      <div className="flex items-start justify-between mb-1 gap-3">
        <h3 className="font-display text-xl">{t("therapist_dashboard.uploadSessionReport")}</h3>
        <span className="chip">{t("therapist_dashboard.afterEveryVisit")}</span>
      </div>
      <p className="text-sm text-text-light mb-4">{t("therapist_dashboard.uploadDesc")}</p>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
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
      </div>
      <label className="eyebrow !text-[0.65rem]">{t("therapist_dashboard.progressNote")}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder={t("therapist_dashboard.notePlaceholder")}
        className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
        disabled={isPending}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File upload area or file preview */}
      {file ? (
        <div className="w-full rounded-xl border-2 border-secondary bg-surface/40 text-secondary transition overflow-hidden">
          {/* Visual Preview — click to open full-screen */}
          {previewUrl && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="relative w-full h-48 bg-black/5 overflow-hidden group cursor-pointer"
            >
              {file.type.startsWith("image/") && (
                <>
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-text rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shadow-lg">
                      <ZoomIn size={14} />
                      View full image
                    </span>
                  </div>
                </>
              )}
              {file.type.startsWith("video/") && (
                <div className="relative w-full h-full">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    controls={false}
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition group-hover:scale-110 group-hover:bg-white">
                      <Play size={24} className="text-text ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    <Maximize2 size={12} />
                    Open video
                  </div>
                </div>
              )}
              {file.type === "application/pdf" && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/10 to-surface transition group-hover:from-secondary/20 group-hover:to-secondary/5">
                  <FileText size={48} className="text-secondary/60 mb-2 transition group-hover:scale-110 group-hover:text-secondary" />
                  <span className="text-sm font-medium text-secondary">PDF Document</span>
                  <span className="text-xs text-text-light mt-1 flex items-center gap-1">
                    <Expand size={12} />
                    Click to preview
                  </span>
                </div>
              )}
            </button>
          )}

          {/* File Info */}
          <div className="flex items-center gap-3 p-4">
            <span className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary grid place-items-center shrink-0">
              {getFileIcon(file.name)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{file.name}</div>
              <div className="text-xs text-text-light mt-0.5">
                {getFileTypeLabel(file.name)} · {formatFileSize(file.size)}
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              disabled={isPending}
              className="p-1.5 rounded-full hover:bg-danger/10 text-text-light hover:text-danger transition shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="w-full p-6 rounded-xl border-2 border-dashed text-center text-sm transition cursor-pointer
            border-border text-text-light hover:border-secondary hover:bg-surface/20
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip size={20} className="mx-auto mb-1" />
          <div className="font-medium">{t("therapist_dashboard.attachFile")}</div>
          <div className="text-xs mt-0.5 text-text-light">{t("therapist_dashboard.fileDesc")}</div>
        </button>
      )}

      <div className="text-center mt-4">
        <button
          onClick={submit}
          disabled={isPending || isSuccess || !patientId || !note.trim()}
          className="btn-secondary !px-6 disabled:opacity-50"
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

      {/* Full-screen file preview dialog */}
      {previewUrl && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl !flex !flex-col !justify-start">
            <DialogTitle className="sr-only">{file?.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Preview of {file?.name}
            </DialogDescription>

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-background">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary grid place-items-center shrink-0">
                  {file && getFileIcon(file.name)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{file?.name}</div>
                  <div className="text-xs text-text-light">
                    {file && getFileTypeLabel(file.name)} · {file && formatFileSize(file.size)}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview body — absolute positioning to prevent image cutting */}
            <div className="flex-1 min-h-0 relative bg-black/5">
              <div className="absolute inset-0 flex items-center justify-center p-6">
                {file?.type.startsWith("image/") && (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
                  />
                )}
                {file?.type.startsWith("video/") && (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl"
                  />
                )}
                {file?.type === "application/pdf" && (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                    title={file.name}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
