"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UploadCloud,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";

export type DocStatus = "uploading" | "done" | "error";

export interface UploadedDoc {
  id: string;
  documentType: string;
  file: File;
  previewUrl?: string;
  status: DocStatus;
  progress: number;
  url?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

interface DocumentUploaderProps {
  label: string;
  hint?: string;
  documentType: string;
  docs: UploadedDoc[];
  onChange: React.Dispatch<React.SetStateAction<UploadedDoc[]>>;
  required?: boolean;
  maxFiles?: number;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx";
const ALLOWED_EXTENSIONS = new Set([
  "pdf", "jpg", "jpeg", "png", "gif", "webp", "doc", "docx",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isImage(file: File): boolean {
  return IMAGE_EXTENSIONS.has(extOf(file.name));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function uploadDocument(
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ url: string; fileName: string; fileSize: number }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads/therapist-application");
    xhr.timeout = 60_000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const item = data?.urls?.[0];
          if (item?.url) {
            resolve({
              url: item.url,
              fileName: item.fileName ?? file.name,
              fileSize: Number(item.fileSize) || file.size,
            });
          } else {
            reject(new Error("No file URL returned"));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const d = JSON.parse(xhr.responseText);
          if (d?.detail) msg = d.detail;
        } catch {
          /* ignore */
        }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    const fd = new FormData();
    fd.append("files", file);
    fd.append("session", "therapist-signup");
    xhr.send(fd);
  });
}

export function DocumentUploader({
  label,
  hint,
  documentType,
  docs,
  onChange,
  required,
  maxFiles = 5,
}: DocumentUploaderProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const doneCount = docs.filter((d) => d.status === "done").length;
  const hasErrors = docs.some((d) => d.status === "error");

  const trackPreviewUrl = useCallback((url?: string) => {
    if (url) previewUrlsRef.current.push(url);
  }, []);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  const upload = useCallback(
    async (file: File, existingId?: string) => {
      const id = existingId ?? uid();
      const isNew = !existingId;

      const previewUrl =
        isNew && isImage(file) ? URL.createObjectURL(file) : undefined;
      if (previewUrl) trackPreviewUrl(previewUrl);

      onChange((current) =>
        isNew
          ? [
              ...current,
              {
                id,
                documentType,
                file,
                previewUrl,
                status: "uploading",
                progress: 0,
              },
            ]
          : current.map((d) =>
              d.id === id
                ? { ...d, status: "uploading", progress: 0, error: undefined }
                : d,
            ),
      );

      try {
        const result = await uploadDocument(file, (pct) => {
          onChange((current) =>
            current.map((d) => (d.id === id ? { ...d, progress: pct } : d)),
          );
        });
        onChange((current) =>
          current.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "done",
                  progress: 100,
                  url: result.url,
                  fileName: result.fileName,
                  fileSize: result.fileSize,
                }
              : d,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        onChange((current) =>
          current.map((d) =>
            d.id === id ? { ...d, status: "error", error: msg } : d,
          ),
        );
      }
    },
    [documentType, onChange, trackPreviewUrl],
  );

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList);

      for (const file of files) {
        const ext = extOf(file.name);
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          toast.error(
            t("auth.uploadInvalidType").replace("{name}", file.name),
          );
          continue;
        }
        if (file.size > MAX_SIZE) {
          toast.error(
            t("auth.uploadTooLarge").replace("{name}", file.name),
          );
          continue;
        }
        void upload(file);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [upload, t],
  );

  const removeDoc = useCallback(
    (id: string) => {
      onChange((current) => current.filter((d) => d.id !== id));
    },
    [onChange],
  );

  const retryDoc = useCallback(
    (id: string) => {
      const target = docs.find((d) => d.id === id);
      if (target) void upload(target.file, id);
    },
    [docs, upload],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-xs font-medium text-text-light">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        <span className="text-[11px] font-mono text-text-light">
          {doneCount}/{maxFiles} {t("auth.uploadUploaded")}
        </span>
      </div>

      {hint && <p className="text-[11px] text-text-light mb-2">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`w-full p-3 rounded-xl border-2 border-dashed text-sm transition-colors cursor-pointer ${
          dragOver
            ? "border-secondary bg-secondary/5 text-secondary"
            : "border-border text-text-light hover:border-secondary hover:text-secondary"
        }`}
      >
        <UploadCloud size={20} className="mx-auto mb-1 opacity-70" />
        <span>{t("auth.uploadTapToAdd")}</span>
        <span className="block text-[11px] text-text-light mt-0.5">
          PDF · JPG · PNG · DOC — {t("auth.uploadMaxSize")}
        </span>
      </button>

      {hasErrors && (
        <p className="text-[11px] text-destructive mt-2">
          {t("auth.uploadSomeFailed")}
        </p>
      )}

      {/* WhatsApp-style previews */}
      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="relative rounded-xl overflow-hidden border border-border bg-surface aspect-square group"
            >
              {d.previewUrl ? (
                <img
                  src={d.previewUrl}
                  alt={d.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2 text-center">
                  <FileText className="text-secondary" size={22} />
                  <span className="text-[10px] text-text-light leading-tight line-clamp-2 break-all">
                    {d.file.name}
                  </span>
                  {d.status === "done" && d.fileSize != null && (
                    <span className="text-[10px] font-mono text-text-light">
                      {formatSize(d.fileSize)}
                    </span>
                  )}
                </div>
              )}

              {/* uploading overlay */}
              {d.status === "uploading" && (
                <div className="absolute inset-0 bg-forest/40 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5">
                  <Loader2 size={20} className="text-white animate-spin" />
                  <span className="text-[11px] font-mono text-white">
                    {d.progress}%
                  </span>
                  <div className="w-3/4 h-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${d.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* success badge */}
              {d.status === "done" && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-success text-white grid place-items-center shadow">
                  <CheckCircle2 size={14} />
                </span>
              )}

              {/* error overlay */}
              {d.status === "error" && (
                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5 px-2 text-center">
                  <AlertCircle size={20} className="text-white" />
                  <span className="text-[10px] text-white leading-tight line-clamp-2">
                    {d.error ?? t("auth.uploadFailed")}
                  </span>
                </div>
              )}

              {/* retry */}
              {d.status === "error" && (
                <button
                  type="button"
                  onClick={() => retryDoc(d.id)}
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white/90 text-text grid place-items-center shadow hover:bg-white"
                  aria-label={t("auth.uploadRetry")}
                >
                  <RotateCcw size={12} />
                </button>
              )}

              {/* remove */}
              <button
                type="button"
                onClick={() => removeDoc(d.id)}
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-forest/70 text-white grid place-items-center hover:bg-forest"
                aria-label={t("auth.uploadRemove")}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
