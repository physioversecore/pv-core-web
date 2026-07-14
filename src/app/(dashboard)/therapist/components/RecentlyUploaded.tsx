"use client";

import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
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

const kindLabel: Record<UploadKind, string> = {
  "x-ray": "X-ray / Image",
  video: "Exercise Video",
  note: "Session Note",
};

const PREVIEWABLE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "webm", "pdf"];
const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXTS = ["mp4", "mov", "avi", "webm"];

function getOriginalName(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("name") ?? url.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

function getDisplayExt(url: string): string {
  const name = getOriginalName(url);
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function getDisplayFileUrl(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    u.searchParams.delete("name");
    return u.pathname + u.search;
  } catch {
    return url.split("?")[0];
  }
}

function isPreviewable(url: string) {
  console.log("DOCUMENTS URL",url)
  return PREVIEWABLE_EXTS.includes(getDisplayExt(url));
}

function isImageUrl(url: string) {
  return IMAGE_EXTS.includes(getDisplayExt(url));
}

function isVideoUrl(url: string) {
  return VIDEO_EXTS.includes(getDisplayExt(url));
}

function isPdfUrl(url: string) {
  return getDisplayExt(url) === "pdf";
}

/* ── preview dialog ── */

function PreviewDialog({
  open,
  onClose,
  title,
  url,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}) {
  const src = getDisplayFileUrl(url);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl !flex !flex-col !justify-start">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          File preview
        </DialogDescription>

        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0 bg-background">
          <div className="text-sm font-medium truncate pr-4">{title}</div>
        </div>

        <div className="flex-1 min-h-0 relative bg-black/5">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {isImageUrl(url) && (
              <img
                src={src}
                alt={title}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-xl"
              />
            )}
            {isVideoUrl(url) && (
              <video
                src={src}
                controls
                autoPlay
                muted
                className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl"
              />
            )}
            {isPdfUrl(url) && (
              <iframe
                src={src}
                className="w-full h-full max-w-full max-h-full rounded-lg shadow-xl border-0"
                title={title}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── main component ── */

export function RecentlyUploaded() {
  const { t } = useLang();
  const { dashboard, isLoading } = useTherapistDashboard();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  if (isLoading) return <CardSkeleton />;

  const uploads = dashboard?.recentUploads ?? [];

  if (uploads.length === 0) {
    return (
      <section className="card-soft p-5 mb-6">
        <div className="eyebrow mb-3">
          {t("therapist_dashboard.recentlyUploaded")}
        </div>
        <p className="text-sm text-text-light py-4">No reports uploaded yet.</p>
      </section>
    );
  }

  return (
    <section className="card-soft p-5 mb-6">
      <div className="eyebrow mb-3">
        {t("therapist_dashboard.recentlyUploaded")}
      </div>

      <div className="divide-y divide-border">
        {uploads.map((u) => {
          const isExpanded = expandedId === u.id;
          const hasContent = !!u.content?.trim();
          const hasFiles = u.files.length > 0;

          return (
            <div key={u.id} className="first:pt-0 last:pb-0">
              {/* ── row header ── */}
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : u.id)
                }
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-surface/30 rounded-lg transition -mx-1 px-1"
              >
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase shrink-0 ${tintMap[u.kind]}`}
                >
                  {iconMap[u.kind]}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {u.patient}
                  </div>
                  <div className="text-xs text-text-light truncate">
                    {u.title}
                  </div>
                </div>

                {/* file count badge */}
                {hasFiles && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface border border-border text-text-light shrink-0">
                    {u.files.length} file{u.files.length > 1 ? "s" : ""}
                  </span>
                )}

                <span className="text-xs text-text-light font-mono shrink-0">
                  {u.date}
                </span>

                {(hasContent || hasFiles) && (
                  <span className="text-text-light shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </span>
                )}
              </button>

              {/* ── expanded body ── */}
              {isExpanded && (
                <div className="pb-4 pl-11 pr-1 space-y-3 animate-in slide-in-from-top-1 fade-in duration-150">
                  {/* kind label */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${tintMap[u.kind]}`}
                  >
                    {iconMap[u.kind]}
                    {kindLabel[u.kind]}
                  </span>

                  {/* progress note */}
                  {hasContent && (
                    <div className="bg-surface/40 rounded-xl p-4 border border-border/50">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-text-light mb-1.5">
                        Progress Note
                      </div>
                      <p className="text-sm text-text pl-2 leading-relaxed whitespace-pre-wrap">
                        {u.content}
                      </p>
                    </div>
                  )}

                  {/* files */}
                  {hasFiles && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-text-light">
                        Attachments
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {u.files.map((url, i) => {
                          const ext = getDisplayExt(url);
                          const name = getOriginalName(url);
                          const previewable = isPreviewable(url);

                          return (
                            <button
                              key={`${u.id}-f${i}`}
                              type="button"
                              onClick={() => {
                                if (previewable) {
                                  setPreviewTitle(`${u.patient} — ${name}`);
                                  setPreviewUrl(url);
                                }
                              }}
                              disabled={!previewable}
                              className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg border text-xs font-medium transition
                                ${previewable
                                  ? "border-border bg-surface/40 hover:bg-surface/70 hover:border-secondary cursor-pointer"
                                  : "border-border bg-surface/20 opacity-60 cursor-default"
                                }`}
                            >
                              <span className="text-text-light uppercase font-mono text-[10px]">
                                {ext}
                              </span>
                              <span className="truncate max-w-[120px] text-text">
                                {name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* full-screen preview dialog */}
      <PreviewDialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title={previewTitle}
        url={previewUrl ?? ""}
      />
    </section>
  );
}
