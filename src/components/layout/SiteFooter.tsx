import Link from "next/link";
import { NAV_LINKS, RESOURCE_LINKS } from "@/constants/navigation";
import { AppStoreBadge } from "@/components/common/AppStoreBadge";
import { useLang } from "@/context/i18n";

export function SiteFooter() {
  const { t } = useLang();
  const navLabel = (to: string): string => {
    const map: Record<string, string> = {
      "/how-it-works": t("nav.howItWorks"),
      "/services": t("nav.services"),
      "/find-a-therapist": t("nav.findTherapist"),
      "/app": t("nav.app"),
      "/blog": t("nav.blog"),
      "/faq": t("nav.faq"),
      "/testimonials": t("nav.testimonials"),
      "/about": t("nav.aboutUs"),
      "/contact": t("nav.contactUs"),
    };
    return map[to] ?? "";
  };

  return (
    <footer className="py-14 text-background/80 bg-background-dark">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-secondary inline-block" />
            <span className="font-display text-lg text-background">{t("footer.brand")}</span>
          </div>
          <p className="text-background/60">{t("footer.tagline")}</p>
          <div className="mt-4 space-y-1 text-background/70">
            <p>{t("footer.email")}</p>
            <p>{t("footer.phone")}</p>
          </div>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">{t("footer.explore")}</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-primary transition">{navLabel(l.to)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">{t("footer.resources")}</p>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="hover:text-primary transition">{navLabel(l.to)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-primary mb-3">{t("footer.getTheApp")}</p>
          <p className="text-background/60 mb-3">{t("footer.appDesc")}</p>
          <div className="flex flex-col gap-2">
            <AppStoreBadge platform="google" variant="footer" />
            <AppStoreBadge platform="apple" variant="footer" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-3 justify-between text-xs text-background/50">
        <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-primary">{t("footer.about")}</Link>
          <Link href="/contact" className="hover:text-primary">{t("footer.contact")}</Link>
          <Link href="/faq" className="hover:text-primary">{t("footer.faq")}</Link>
        </div>
      </div>
    </footer>
  );
}
