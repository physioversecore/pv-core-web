import { Smartphone } from "lucide-react";
import { useLang } from "@/context/i18n";

interface AppStoreBadgeProps {
  platform: "google" | "apple";
  variant?: "hero" | "footer" | "section";
  href?: string;
}

const styles = {
  hero: "inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-sm",
  section: "inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black text-white hover:bg-black/80 transition",
  footer: "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-xs",
} as const;

export function AppStoreBadge({ platform, variant = "section", href = "#" }: AppStoreBadgeProps) {
  const { t } = useLang();
  const label = platform === "google" ? t("footer.googlePlay") : t("footer.appStore");
  const caption = platform === "google" ? t("footer.getItOn") : t("footer.downloadOnThe");

  return (
    <a href={href} className={styles[variant]}>
      <Smartphone size={variant === "footer" ? 14 : variant === "hero" ? 18 : 20} />
      <span className="text-left leading-tight">
        <span className="block text-[10px] opacity-70">{caption}</span>
        <span className={`font-semibold ${variant === "footer" ? "text-xs" : "text-sm"}`}>{label}</span>
      </span>
    </a>
  );
}
