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
      "/for-physiotherapists": t("nav.forPhysiotherapists"),
      "/blog": t("nav.blog"),
      "/faq": t("nav.faq"),
      "/testimonials": t("nav.testimonials"),
      "/about": t("nav.aboutUs"),
      "/contact": t("nav.contactUs"),
    };
    return map[to] ?? "";
  };

  return (
    <footer className="w-full px-5 lg:px-8 py-16 md:py-20 bg-carbon grid-bg text-paper-bright rounded-t-3xl">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-volt border-2 border-carbon inline-block" />
            <span className="font-display font-extrabold text-lg text-volt">{t("footer.brand")}</span>
          </div>
          <p className="text-paper-bright/70">{t("footer.tagline")}</p>
          <div className="mt-4 space-y-1 text-paper-bright/70">
            <p>{t("footer.email")}</p>
            <p>{t("footer.phone")}</p>
          </div>
        </div>

        <div>
          <p className="label-ink !text-volt mb-4">{t("footer.explore")}</p>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="text-paper-bright/70 hover:text-volt transition">{navLabel(l.to)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-ink !text-volt mb-4">{t("footer.resources")}</p>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="text-paper-bright/70 hover:text-volt transition">{navLabel(l.to)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-ink text-volt! mb-4 inline-flex item-center gap-1">
            <span>
              {t("footer.getTheApp")}
            </span>
            <span className="chip-volt text-[9px] -mt-1">
              {t("services.soon")}
            </span>
          </p>
          <p className="text-paper-bright/60 mb-4">{t("footer.appDesc")}</p>

          <div className="flex flex-col gap-2">
            <AppStoreBadge platform="google" variant="footer" />
            <AppStoreBadge platform="apple" variant="footer" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-paper-bright/15 flex flex-wrap gap-3 justify-between text-xs text-paper-bright/50">
        <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-volt">{t("footer.about")}</Link>
          <Link href="/contact" className="hover:text-volt">{t("footer.contact")}</Link>
          <Link href="/faq" className="hover:text-volt">{t("footer.faq")}</Link>
        </div>
      </div>
    </footer>
  );
}
