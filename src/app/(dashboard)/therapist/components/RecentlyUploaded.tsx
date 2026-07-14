"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Video, Eye, X } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useTherapistDashboard } from "@/hooks/useTherapistDashboard";
import { CardSkeleton } from "@/components/SuspenseFallback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UploadKind } from "@/types";

const iconMap: Record<UploadKind, React.ReactNode> = {
  "x-ray": <ImageIcon size={14} />,
  video: <Video size={14} />,
  note: <FileText size={14} />,
};

const tintMap: Record<UploadKind, string> = {
  "x-ray": "bg-primary/10 text-primary",
  video: "bg-amber/10 text-amber",
  note: "bg-surface text-secondary",
};

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|avi|webm)$/i.test(url);
}

function isPdfUrl(url: string) {
  return /\.pdf$/i.test(url);
}

export function RecentlyUploaded() {
  const { t } = useLang();
  const { dashboard, isLoading } = useTherapistDashboard();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  if (isLoading) return <CardSkeleton />;

  const uploads = dashboard?.recentUploads ?? [];

  if (uploads.length === 0) {
    return (
      <section className="card-soft p-5 mb-6">
        <div className="eyebrow mb-3">{t("therapist_dashboard.recentlyUploaded")}</div>
        <p className="text-sm text-text-light py-4">No reports uploaded yet.</p>
      </section>
    );
  }

  return (
    <section className="card-soft p-5 mb-6">
      <div className="eyebrow mb-3">{t("therapist_dashboard.recentlyUploaded")}</div>
      <div className="divide-y divide-border">
        {uploads.map((u) => (
          <div key={u.id} className="flex items-center gap-3 py-3">
            <span className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase ${tintMap[u.kind]}`}>
              {iconMap[u.kind]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{u.patient}</div>
              <div className="text-xs text-text-light truncate">
                {u.title}
              </div>
            </div>
            {u.file && (isImageUrl(u.file) || isVideoUrl(u.file) || isPdfUrl(u.file)) && (
              <button
                onClick={() => {
                  setPreviewUrl(u.file);
                  setPreviewTitle(`${u.patient} — ${u.title}`);
                }}
                className="p-1.5 rounded-full hover:bg-surface text-text-light hover:text-secondary transition shrink-0"
                title="View attachment"
              >
                <Eye size={14} />
              </button>
            )}
            <div className="text-xs text-text-light font-mono">{u.date}</div>
          </div>
        ))}
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl !flex !flex-col !justify-start">
          <DialogTitle className="sr-only">{previewTitle}</DialogTitle>
          <DialogDescription className="sr-only">Attachment preview</DialogDescription>

          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-background">
            <div className="text-sm font-medium truncate">{previewTitle}</div>
            <button
              onClick={() => setPreviewUrl(null)}
              className="p-1.5 rounded-full hover:bg-surface text-text-light hover:text-text transition"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 min-h-0 relative bg-black/5">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {previewUrl && isImageUrl(previewUrl) && (
                <img
                  src={previewUrl}
                  alt={previewTitle}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
                />
              )}
              {previewUrl && isVideoUrl(previewUrl) && (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  muted
                  className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl"
                />
              )}
              {previewUrl && isPdfUrl(previewUrl) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                  title={previewTitle}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
