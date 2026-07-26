import type { TherapistReportData } from "@/services/api/reports";

export function detectKind(r: TherapistReportData): string {
  if (!r.fileUrl) return "note";
  const ext = r.fileUrl.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "x-ray";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  return "note";
}

export const kindTint: Record<string, string> = {
  "x-ray": "bg-primary/10 text-primary",
  video: "bg-amber/10 text-amber",
  note: "bg-surface text-secondary",
};

export const kindLabel: Record<string, string> = {
  "x-ray": "X-ray / Image",
  video: "Exercise Video",
  note: "Session Note",
};

export function getOriginalName(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get("name") ?? url.split("/").pop() ?? url;
  } catch {
    return url.split("/").pop() ?? url;
  }
}

export function getDisplayFileUrl(url: string): string {
  try {
    const u = new URL(url, "http://localhost");
    u.searchParams.delete("name");
    u.searchParams.delete("size");
    return u.pathname;
  } catch {
    return url.split("?")[0];
  }
}

export function getFileSize(url: string): number {
  try {
    const u = new URL(url, "http://localhost");
    return Number(u.searchParams.get("size")) || 0;
  } catch {
    return 0;
  }
}
