"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Image as ImageIcon,
  Video,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { CardSkeleton } from "@/components/SuspenseFallback";
import {
  getTherapistReports,
  deleteReport,
  type TherapistReportData,
} from "@/services/api/reports";
import { PreviewDialog, isPreviewableByName } from "@/components/PreviewDialog";
import { ConfirmDialog } from "@/components/tables/ConfirmDialog";
import {
  detectKind,
  kindTint,
  kindLabel,
  getOriginalName,
  getDisplayFileUrl,
  getFileSize,
} from "./report-helpers";

const LIMIT = 6;

const iconMap: Record<string, React.ReactNode> = {
  "x-ray": <ImageIcon size={14} />,
  video: <Video size={14} />,
  note: <FileText size={14} />,
};

function getDisplayExt(url: string): string {
  return getOriginalName(url).split(".").pop()?.toLowerCase() ?? "";
}

interface RecentlyUploadedProps {
  paginated?: boolean;
}

export function RecentlyUploaded({ paginated = false }: RecentlyUploadedProps) {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileSize, setPreviewFileSize] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<TherapistReportData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["therapist-reports", page],
    queryFn: () => getTherapistReports(page, LIMIT),
    placeholderData: paginated ? (prev) => prev : undefined,
  });

  useEffect(() => {
    if (!paginated) return;
    return () => {
      queryClient.removeQueries({ queryKey: ["therapist-reports"] });
    };
  }, [paginated, queryClient]);

  const uploads = data?.reports ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteReport(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["therapist-reports"] });
      if (expandedId === deleteTarget.id) setExpandedId(null);
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }, [deleteTarget, queryClient, expandedId]);

  if (isLoading) return <CardSkeleton />;

  if (uploads.length === 0) {
    return (
      <section className={`card-soft p-5 ${paginated ? "" : "mb-6"}`}>
        <div className="eyebrow mb-3">
          {t("therapist_dashboard.recentlyUploaded")}
        </div>
        <p className="text-sm text-text-light py-4">No reports uploaded yet.</p>
      </section>
    );
  }

  return (
    <section className={`card-soft p-5 ${paginated ? "" : "mb-6"}`}>
      <div className="flex items-center justify-between mb-3">
        {paginated ? (
          <div>
            <p className="eyebrow mb-1">{t("therapist_dashboard.reportsRecent")}</p>
            <h3 className="font-display text-lg">{t("therapist_dashboard.reportsPatientReports")}</h3>
          </div>
        ) : (
          <div className="eyebrow">
            {t("therapist_dashboard.recentlyUploaded")}
          </div>
        )}

        {paginated ? (
          total > 0 && <span className="chip">{total}</span>
        ) : (
          total > LIMIT && (
            <Link
              href="/therapist/reports"
              className="text-xs text-secondary font-medium hover:underline inline-flex items-center gap-0.5"
            >
              View all ({total})
              <ChevronRight size={12} />
            </Link>
          )
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
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(isExpanded ? null : u.id);
                  }
                }}
                onClick={() => setExpandedId(isExpanded ? null : u.id)}
                className="w-full flex items-center gap-3 py-3 text-left hover:bg-surface/30 rounded-lg transition -mx-1 px-1 cursor-pointer"
              >
                <span
                  className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-[10px] uppercase shrink-0 ${kindTint[kind]}`}
                >
                  {iconMap[kind]}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.patient}</div>
                  <div className="text-[11px] text-text-light truncate">{u.title}</div>
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(u);
                  }}
                  disabled={deletingId === u.id}
                  className="shrink-0 p-1 rounded text-text-light hover:text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {isExpanded && (
                <div className="pb-4 pl-11 pr-1 space-y-3 animate-in slide-in-from-top-1 fade-in duration-150">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${kindTint[kind]}`}
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

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-text-light">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition
                  ${p === page
                    ? "bg-secondary text-white"
                    : "border border-border hover:bg-surface text-text-light"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {paginated && isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 size={14} className="animate-spin text-text-light" />
        </div>
      )}

      <PreviewDialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title={previewTitle}
        src={previewUrl ?? ""}
        fileName={previewFileName}
        fileSize={previewFileSize || undefined}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Delete report"
        description={`Delete <strong>${deleteTarget?.patient}'s</strong> ${deleteTarget?.title} ? This cannot be undone.`}
      />
    </section>
  );
}
