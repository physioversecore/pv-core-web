"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/context/i18n";
import { UploadReport } from "../components/UploadReport";
import {
  getTherapistReports,
  type TherapistReportData,
} from "@/services/api/reports";
import { PreviewDialog, isPreviewableByName } from "@/components/PreviewDialog";
import { CardSkeleton } from "@/components/SuspenseFallback";

const ITEMS_PER_PAGE = 6;

/* ── helpers ── */

function getOriginalName(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("name") ?? url.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
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

function getFileSize(url: string): number {
  try {
    const u = new URL(url, "http://localhost");
    return Number(u.searchParams.get("size")) || 0;
  } catch {
    return 0;
  }
}

function detectKind(r: TherapistReportData): string {
  if (!r.fileUrl) return "note";
  const ext = r.fileUrl.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "x-ray";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  return "note";
}

const kindTint: Record<string, string> = {
  "x-ray": "bg-primary/10 text-primary",
  video: "bg-amber/10 text-amber",
  note: "bg-surface text-secondary",
};

const kindLabel: Record<string, string> = {
  "x-ray": "X-ray / Image",
  video: "Exercise Video",
  note: "Session Note",
};

/* ── component ── */

export default function ReportsUpload() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileSize, setPreviewFileSize] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["therapist-reports", page],
    queryFn: () => getTherapistReports(page, ITEMS_PER_PAGE),
    placeholderData: (prev) => prev,
  });

  const reports = data?.reports ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["therapist-reports"] });
  }, [queryClient]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["therapist-reports"] });
    };
  }, [queryClient]);

  return (
    <div className="grid gap-4">
      <UploadReport />

      <section className="card-soft p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="eyebrow mb-1">{t("therapist_dashboard.reportsRecent")}</p>
            <h3 className="font-display text-lg">{t("therapist_dashboard.reportsPatientReports")}</h3>
          </div>
          {total > 0 && (
            <span className="chip">{total}</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <p className="text-sm text-text-light py-4">No reports uploaded yet.</p>
        ) : (
          <>
            <div className="divide-y divide-border">
              {reports.map((r) => {
                const isExpanded = expandedId === r.id;
                const kind = detectKind(r);
                const hasContent = !!r.content?.trim();
                const hasFiles = r.files.length > 0;

                return (
                  <div key={r.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="w-full flex items-start gap-3 py-3 text-left hover:bg-surface/30 rounded-lg transition -mx-1 px-1"
                    >
                      <span
                        className={`w-9 h-9 rounded-lg grid place-items-center font-mono text-[10px] uppercase shrink-0 ${kindTint[kind]}`}
                      >
                        {kind === "note" ? "PDF" : kind === "x-ray" ? "IMG" : "VID"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{r.patient}</div>
                        <div className="text-xs text-text-light truncate">
                          {r.title}
                          {hasFiles && (
                            <span className="ml-1 font-mono">
                              · {r.files.length} file{r.files.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-text-light font-mono shrink-0">{r.date}</div>
                    </button>

                    {isExpanded && (
                      <div className="pb-3 pl-12 pr-1 space-y-3 animate-in slide-in-from-top-1 fade-in duration-150">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${kindTint[kind]}`}
                        >
                          {kindLabel[kind]}
                        </span>

                        {hasContent && (
                          <div className="bg-surface/40 rounded-xl p-4 border border-border/50">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-text-light mb-1.5">
                              Progress Note
                            </div>
                            <p className="text-sm text-text pl-2 leading-relaxed whitespace-pre-wrap">
                              {r.content}
                            </p>
                          </div>
                        )}

                        {hasFiles && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-medium uppercase tracking-wider text-text-light">
                              Attachments
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {r.files.map((url, i) => {
                                const name = getOriginalName(url);
                                const previewable = isPreviewableByName(name);
                                const ext = name.split(".").pop()?.toUpperCase() ?? "";

                                return (
                                  <button
                                    key={`${r.id}-f${i}`}
                                    type="button"
                                    onClick={() => {
                                      if (previewable) {
                                        setPreviewTitle(`${r.patient} — ${name}`);
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

            {/* pagination */}
            {totalPages > 1 && (
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

            {isFetching && !isLoading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 size={14} className="animate-spin text-text-light" />
              </div>
            )}
          </>
        )}
      </section>

      <PreviewDialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        title={previewTitle}
        src={previewUrl ?? ""}
        fileName={previewFileName}
        fileSize={previewFileSize || undefined}
      />
    </div>
  );
}
