"use client";

import { useMemo } from "react";
import { FileText, Image as ImageIcon, Video, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/sahayatri\.session=([^;]+)/);
  return match ? match[1] : null;
}

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXTS = ["mp4", "mov", "avi", "webm"];

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isImageUrl(name: string) {
  return IMAGE_EXTS.includes(extOf(name));
}

function isVideoUrl(name: string) {
  return VIDEO_EXTS.includes(extOf(name));
}

function isPdfUrl(name: string) {
  return extOf(name) === "pdf";
}

function isDocUrl(name: string) {
  const ext = extOf(name);
  return ["doc", "docx"].includes(ext);
}

export function getFileIcon(name: string, size = 16) {
  const ext = extOf(name);
  if (ext === "pdf") return <FileText size={size} />;
  if (IMAGE_EXTS.includes(ext)) return <ImageIcon size={size} />;
  if (VIDEO_EXTS.includes(ext)) return <Video size={size} />;
  return <File size={size} />;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPreviewableByName(name: string): boolean {
  const ext = extOf(name);
  return [
    "jpg", "jpeg", "png", "gif", "webp",
    "mp4", "mov", "avi", "webm",
    "pdf", "doc", "docx",
  ].includes(ext);
}

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  src: string;
  fileName?: string;
  fileSize?: number;
}

export function PreviewDialog({
  open,
  onClose,
  title,
  src,
  fileName,
  fileSize,
}: PreviewDialogProps) {
  const authSrc = useMemo(() => {
    if (!src) return src;
    const token = getAuthToken();
    if (!token) return src;
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}token=${token}`;
  }, [src]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl !flex !flex-col !justify-start">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          File preview
        </DialogDescription>

        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-background">
          <div className="flex items-center gap-2.5 min-w-0">
            {fileName && (
              <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary grid place-items-center shrink-0">
                {getFileIcon(fileName)}
              </span>
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{title}</div>
              {fileName && (
                <div className="text-xs text-text-light">
                  {fileSize != null && `${formatFileSize(fileSize)}`}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative bg-black/5">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {authSrc && isImageUrl(fileName ?? title) && (
              <img
                src={authSrc}
                alt={title}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
              />
            )}
            {authSrc && isVideoUrl(fileName ?? title) && (
              <video
                src={authSrc}
                controls
                autoPlay
                muted
                className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl"
              />
            )}
            {authSrc && isPdfUrl(fileName ?? title) && (
              <iframe
                src={authSrc}
                className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                title={title}
              />
            )}
            {authSrc && isDocUrl(fileName ?? title) && (
              <iframe
                src={authSrc}
                className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                title={title}
              />
            )}
            {!authSrc && (
              <p className="text-sm text-text-light">Unable to load preview.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
