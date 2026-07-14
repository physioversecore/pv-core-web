"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
  Paperclip,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { getMyPatients } from "@/services/api/reports";
import {
  PreviewDialog,
  getFileIcon,
  formatFileSize,
  isPreviewableByName,
} from "@/components/PreviewDialog";

const REPORT_TYPES = [
  "Session note",
  "Progress report",
  "X-ray / Image",
  "Exercise video",
];
const ACCEPTED_TYPES =
  ".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.doc,.docx,.webm";

/* ── helpers ── */

function getFileTint(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "bg-secondary/10 text-secondary";
  if (["jpg", "jpeg", "png", "gif"].includes(ext ?? ""))
    return "bg-primary/10 text-primary";
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? ""))
    return "bg-amber/10 text-amber";
  return "bg-surface text-text-light";
}

/* ── picked file wrapper (stable uid for React keys) ── */

let _uid = 0;

interface PickedFile {
  uid: string;
  file: File;
}

function toPicked(file: File): PickedFile {
  return { uid: `pf-${++_uid}-${Date.now()}`, file };
}

/* ── component ── */

export function UploadReport() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* form state */
  const [patientId, setPatientId] = useState("");
  const [kind, setKind] = useState(REPORT_TYPES[0]);
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState<PickedFile[]>([]);

  /* ui state */
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* patients list */
  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["my-patients"],
    queryFn: () => getMyPatients(),
  });
  const patients = useMemo(() => patientsData ?? [], [patientsData]);

  /* ── reset ── */

  const resetForm = useCallback(() => {
    setPatientId("");
    setKind(REPORT_TYPES[0]);
    setNote("");
    setPicked([]);
  }, []);

  /* ── file selection ── */

  const addFiles = useCallback((input: FileList | null) => {
    if (!input) return;
    const files = Array.from(input).map(toPicked);
    setPicked((prev) => [...prev, ...files]);
  }, []);

  const removeFile = useCallback((uid: string) => {
    setPicked((prev) => prev.filter((f) => f.uid !== uid));
  }, []);

  /* ── preview ── */

  const openPreview = useCallback(
    (f: File) => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(f);
      setPreviewFile(f);
      setPreviewUrl(url);
    },
    [previewUrl],
  );

  const closePreview = useCallback(() => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  /* ── submit: single FormData POST ── */

  const submit = async () => {
    if (!patientId)
      return toast.error(t("therapist_dashboard.errorPickPatient"));
    if (!note.trim()) return toast.error("Please add a progress note");
    if (picked.length === 0) return toast.error("Attach at least one file");
    if (isUploading || submitted) return;

    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append("patientId", patientId);
      fd.append("title", kind);
      fd.append("content", note);
      for (const pf of picked) {
        fd.append("files", pf.file);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Upload failed (${res.status})`);
      }

      toast.success(t("therapist_dashboard.reportUploaded"));
      queryClient.invalidateQueries({ queryKey: ["therapist-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["therapist-reports"] });

      setSubmitted(true);
      timerRef.current = setTimeout(() => {
        setSubmitted(false);
        resetForm();
      }, 200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  /* ── render ── */

  const fileCount = picked.length;

  return (
    <section className="card-soft p-6 mb-6">
      {/* header */}
      <div className="flex items-start justify-between mb-1 gap-3">
        <h3 className="font-display text-xl">
          {t("therapist_dashboard.uploadSessionReport")}
        </h3>
        <span className="chip">
          {t("therapist_dashboard.afterEveryVisit")}
        </span>
      </div>
      <p className="text-sm text-text-light mb-5">
        {t("therapist_dashboard.uploadDesc")}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        onChange={(e) => {
          addFiles(e.target.files);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="hidden"
      />

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* ── left: form ── */}
        <div className="space-y-4">
          {/* patient */}
          <div>
            <label className="eyebrow !text-[0.65rem]">
              {t("therapist_dashboard.patientLabel")}
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              disabled={isUploading || patientsLoading}
            >
              <option value="">
                {patientsLoading
                  ? "Loading patients…"
                  : t("therapist_dashboard.selectPatient")}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* report type */}
          <div>
            <label className="eyebrow !text-[0.65rem]">
              {t("therapist_dashboard.reportType")}
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm"
              disabled={isUploading}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* progress note */}
          <div>
            <label className="eyebrow !text-[0.65rem]">
              {t("therapist_dashboard.progressNote")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder={t("therapist_dashboard.notePlaceholder")}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white text-sm resize-none"
              disabled={isUploading}
            />
          </div>

          {/* submit */}
          <button
            onClick={submit}
            disabled={isUploading || submitted || !patientId || !note.trim()}
            className="btn-secondary !px-6 w-full disabled:opacity-50"
          >
            {isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t("common.upload")}…
              </span>
            ) : submitted ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} />
                {t("therapist_dashboard.reportUploaded")}
              </span>
            ) : (
              t("therapist_dashboard.uploadNotify")
            )}
          </button>
        </div>

        {/* ── right: files ── */}
        <div className="space-y-3">
          <label className="eyebrow !text-[0.65rem]">
            {t("therapist_dashboard.attachFile")}
          </label>

          {/* drop zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-8 rounded-xl border-2 border-dashed text-sm transition cursor-pointer flex flex-col items-center justify-center gap-2
              border-border text-text-light hover:border-secondary hover:bg-surface/20
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip size={20} />
            <span className="font-medium">
              {fileCount > 0
                ? `${fileCount} file${fileCount > 1 ? "s" : ""} selected — click to add more`
                : t("therapist_dashboard.attachFile")}
            </span>
          </button>

          {/* file pills */}
          <div className="flex flex-wrap gap-2">
            {picked.map((pf) => (
              <div
                key={pf.uid}
                className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg border border-border bg-surface/40"
              >
                <span
                  className={`w-5 h-5 rounded grid place-items-center shrink-0 ${getFileTint(pf.file.name)}`}
                >
                  {getFileIcon(pf.file.name, 11)}
                </span>
                <span
                  className="text-[11px] font-medium leading-none truncate max-w-[100px] cursor-pointer hover:text-secondary transition"
                  onClick={() => isPreviewableByName(pf.file.name) && openPreview(pf.file)}
                >
                  {pf.file.name}
                </span>
                <span className="text-[10px] text-text-light leading-none">
                  {formatFileSize(pf.file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(pf.uid)}
                  disabled={isUploading}
                  className="p-0.5 rounded hover:bg-danger/10 text-text-light hover:text-danger transition shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* shared preview dialog */}
      <PreviewDialog
        open={!!previewFile}
        onClose={closePreview}
        title={previewFile?.name ?? ""}
        src={previewUrl ?? ""}
        fileName={previewFile?.name}
        fileSize={previewFile?.size}
      />
    </section>
  );
}
