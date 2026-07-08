import { Smartphone } from "lucide-react";
import { useLang } from "@/context/i18n";
import styles from "./AppStoreBadge.module.css";

interface AppStoreBadgeProps {
  platform: "google" | "apple";
  variant?: "hero" | "footer" | "section";
  href?: string;
}

const variantConfig: Record<string, { variantClass: string; iconSize: number; labelSize: string }> = {
  hero: {
    variantClass: styles.hero,
    iconSize: 18,
    labelSize: "text-sm",
  },
  section: {
    variantClass: styles.section,
    iconSize: 20,
    labelSize: "text-sm",
  },
  footer: {
    variantClass: styles.footer,
    iconSize: 14,
    labelSize: "text-xs",
  },
};

export function AppStoreBadge({ platform, variant = "section", href = "#" }: AppStoreBadgeProps) {
  const { t } = useLang();
  const label = platform === "google" ? t("footer.googlePlay") : t("footer.appStore");
  const caption = platform === "google" ? t("footer.getItOn") : t("footer.downloadOnThe");
  const cfg = variantConfig[variant];

  return (
    <a href={href} className={cfg.variantClass}>
      <Smartphone size={cfg.iconSize} />
      <span className="text-left leading-tight">
        <span className={`block ${styles.caption}`}>{caption}</span>
        <span className={`font-semibold ${cfg.labelSize}`}>{label}</span>
      </span>
    </a>
  );
}
