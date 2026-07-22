"use client";

import { useCallback, useState } from "react";
import { Download, Eye, FileText, Image as ImageIcon, Video, File } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { usePatientReports } from "@/hooks/usePatientReports";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import {
  PreviewDialog,
  isPreviewableByName,
  getFileIcon,
  formatFileSize,
} from "@/components/PreviewDialog";

function getOriginalName(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("name") ?? url.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

function getFileUrl(url: string): string {
  const clean = url.split("?")[0];
  const uploadsMatch = clean.match(/\/uploads\/(.+)$/);
  if (uploadsMatch) {
    return `/api/v1/uploads/${uploadsMatch[1]}`;
  }
  return clean;
}

function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/sahayatri\.session=([^;]+)/);
  return match ? match[1] : null;
}

function withToken(url: string): string {
  const token = getAuthToken();
  if (!token) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${token}`;
}

function getFileSize(url: string): number {
  try {
    const u = new URL(url, "http://localhost");
    return Number(u.searchParams.get("size")) || 0;
  } catch {
    return 0;
  }
}

function getFileTint(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "bg-primary/10 text-primary";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "bg-amber/10 text-amber";
  if (ext === "pdf") return "bg-secondary/10 text-secondary";
  return "bg-surface text-text-light";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Reports() {
  const { t } = useLang();
  const { reports, isLoading, refetch, isRefetching } = usePatientReports();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileSize, setPreviewFileSize] = useState(0);

  const openPreview = useCallback((fileUrl: string) => {
    const name = getOriginalName(fileUrl);
    setPreviewTitle(name);
    setPreviewFileName(name);
    setPreviewFileSize(getFileSize(fileUrl));
    setPreviewUrl(getFileUrl(fileUrl));
  }, []);

  const handleDownload = useCallback(async (fileUrl: string) => {
    const name = getOriginalName(fileUrl);
    const url = withToken(getFileUrl(fileUrl));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(`${t("patient_dashboard.downloaded")} ${name}`);
    } catch {
      toast.error("Failed to download file");
    }
  }, [t]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg">{t("therapist_dashboard.recentlyUploaded")}</h2>
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>

      {isLoading ? (
        <div className="card-soft divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-surface rounded animate-pulse" />
                <div className="h-3 w-48 bg-surface rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <FileText size={32} className="mx-auto text-text-light mb-3 opacity-40" />
          <p className="text-sm text-text-light">No reports uploaded yet.</p>
        </div>
      ) : (
        <div className="card-soft divide-y divide-border">
          {reports.map((r) => {
            const files = r.fileUrl
              ? r.fileUrl.split(",").filter((u) => u.trim())
              : [];

            return (
              <div key={r.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${files.length > 0 ? getFileTint(getOriginalName(files[0])) : "bg-surface text-secondary"}`}>
                  {files.length > 0
                    ? getFileIcon(getOriginalName(files[0]))
                    : <FileText size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.title}</div>
                  <div className="text-xs text-text-light">
                    {formatDate(r.createdAt)}
                    {files.length > 0 && (
                      <span className="ml-2">
                        · {files.length} file{files.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {r.content && (
                    <p className="text-xs text-text-light mt-1 line-clamp-1">{r.content}</p>
                  )}
                </div>

                {files.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {files.map((url, i) => {
                      const name = getOriginalName(url);
                      const previewable = isPreviewableByName(name);
                      return (
                        <div key={i} className="flex items-center gap-1">
                          {previewable && (
                            <button
                              onClick={() => openPreview(url)}
                              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(url)}
                            className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1"
                          >
                            <Download size={12} />
                            {name.split(".").pop()?.toUpperCase() || "FILE"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
    </div>
  );
}
