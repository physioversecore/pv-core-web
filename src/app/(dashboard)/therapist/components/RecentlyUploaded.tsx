"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/context/i18n";
import { CardSkeleton } from "@/components/SuspenseFallback";
import {
  getTherapistReports,
  type TherapistReportData,
} from "@/services/api/reports";
import { PreviewDialog, isPreviewableByName } from "@/components/PreviewDialog";

const iconMap: Record<string, React.ReactNode> = {
  "x-ray": <ImageIcon size={14} />,
  video: <Video size={14} />,
  note: <FileText size={14} />,
};

const tintMap: Record<string, string> = {
  "x-ray": "bg-primary/10 text-primary",
  video: "bg-amber/10 text-amber",
  note: "bg-surface text-secondary",
};

const kindLabel: Record<string, string> = {
  "x-ray": "X-ray / Image",
  video: "Exercise Video",
  note: "Session Note",
};

function detectKind(r: TherapistReportData): string {
  if (!r.fileUrl) return "note";
  const ext = r.fileUrl.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "x-ray";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  return "note";
}

function getOriginalName(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("name") ?? url.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

function getFileSize(url: string): number {
  try {
    const u = new URL(url, "http://localhost");
    return Number(u.searchParams.get("size")) || 0;
  } catch {
    return 0;
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
    u.searchParams.delete("size");
    return u.pathname;
  } catch {
    return url.split("?")[0];
  }
}

const OVERVIEW_LIMIT = 6;

export function RecentlyUploaded() {
  const { t } = useLang();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileSize, setPreviewFileSize] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["therapist-reports", 1],
    queryFn: () => getTherapistReports(1, OVERVIEW_LIMIT),
  });

  const uploads = data?.reports ?? [];
  const total = data?.total ?? 0;

  if (isLoading) return <CardSkeleton />;

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
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow">
          {t("therapist_dashboard.recentlyUploaded")}
        </div>
        {total > OVERVIEW_LIMIT && (
          <Link
            href="/therapist/reports"
            className="text-xs text-secondary font-medium hover:underline inline-flex items-center gap-0.5"
          >
            View all ({total})
            <ChevronRight size={12} />
          </Link>
        )}
      </div>

      <div className="divide-y divide-border">
        {uploads.map((u) => {
          const isExpanded = expandedId === u.id;
          const kind = detectKind(u);
          const hasContent = !!u.content?.trim();
          const hasFiles = u.files.length > 0;

          return (
            <div key={u.id} className="first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : u.id)}
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-surface/30 rounded-lg transition -mx-1 px-1"
              >
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase shrink-0 ${tintMap[kind]}`}
                >
                  {iconMap[kind]}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.patient}</div>
                  <div className="text-xs text-text-light truncate">{u.title}</div>
                </div>

                {hasFiles && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface border border-border text-text-light shrink-0">
                    {u.files.length} file{u.files.length > 1 ? "s" : ""}
                  </span>
                )}

                <span className="text-xs text-text-light font-mono shrink-0">{u.date}</span>

                {(hasContent || hasFiles) && (
                  <span className="text-text-light shrink-0">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="pb-4 pl-11 pr-1 space-y-3 animate-in slide-in-from-top-1 fade-in duration-150">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${tintMap[kind]}`}
                  >
                    {iconMap[kind]}
                    {kindLabel[kind]}
                  </span>

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

                  {hasFiles && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-text-light">
                        Attachments
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {u.files.map((url, i) => {
                          const ext = getDisplayExt(url);
                          const name = getOriginalName(url);
                          const previewable = isPreviewableByName(name);

                          return (
                            <button
                              key={`${u.id}-f${i}`}
                              type="button"
                              onClick={() => {
                                if (previewable) {
                                  setPreviewTitle(`${u.patient} — ${name}`);
                                  setPreviewFileName(name);
                                  setPreviewFileSize(getFileSize(url));
                                  setPreviewUrl(getDisplayFileUrl(url));
                                }
                              }}
                              disabled={!previewable}
                              className={`inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg border text-xs font-medium transition
                                ${previewable
                                  ? "border-border bg-surface/40 hover:bg-surface/70 hover:border-secondary cursor-pointer"
                                  : "border-border bg-surface/20 opacity-60 cursor-default"
                                }`}
                            >
                              <span className="text-text-light uppercase font-mono text-[10px]">{ext}</span>
                              <span className="truncate max-w-[120px] text-text">{name}</span>
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

      <PreviewDialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title={previewTitle}
        src={previewUrl ?? ""}
        fileName={previewFileName}
        fileSize={previewFileSize || undefined}
      />
    </section>
  );
}
