const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch]);
}

const PH = "\u0001";
const PH_END = "\u0002";

export function sanitizeRichText(value: string): string {
  const step1 = value.replace(/<\/?strong>/gi, (match) =>
    match.startsWith("/") ? PH_END : PH,
  );
  const step2 = escapeHtml(step1);
  return step2.split(PH).join("<strong>").split(PH_END).join("</strong>");
}

export function isSafeAssetUrl(
  url: string | null | undefined,
  allowAbsoluteHttps = true,
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.includes("\\") || trimmed.startsWith("//")) return null;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    if (allowAbsoluteHttps && trimmed.startsWith("https://")) return trimmed;
    return null;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

export function isSafeRelativeHref(
  href: string | null | undefined,
): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\")) return null;
  if (trimmed.includes(":")) return null;
  return trimmed;
}
