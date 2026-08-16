"use client";

import Link from "next/link";
import { Linkedin, Music2, X } from "lucide-react";
import { NAV_LINKS, RESOURCE_LINKS } from "@/constants/navigation";
import { AppStoreBadge } from "@/components/common/AppStoreBadge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang } from "@/context/i18n";

export function SiteFooter() {
  const { t } = useLang();

  const navLabel = (to: string): string => {
    const map: Record<string, string> = {
      "/how-it-works": t("nav.howItWorks"),
      "/services": t("nav.services"),
      "/find-a-therapist": t("nav.findTherapist"),
      "/blog": t("nav.blog"),
      "/faq": t("nav.faq"),
      "/testimonials": t("nav.testimonials"),
      "/about": t("nav.aboutUs"),
      "/contact": t("nav.contactUs"),
    };
    return map[to] ?? "";
  };

  const columns: { heading: string; links: { to: string; label: string }[] }[] = [
    {
      heading: t("footer.explore"),
      links: NAV_LINKS.map((l) => ({ to: l.to, label: navLabel(l.to) })),
    },
    {
      heading: t("footer.resources"),
      links: RESOURCE_LINKS.map((l) => ({ to: l.to, label: navLabel(l.to) })),
    },
    {
      heading: t("footer.company"),
      links: [
        { to: "/about", label: t("nav.aboutUs") },
        { to: "/contact", label: t("nav.contactUs") },
      ],
    },
    {
      heading: t("footer.legal"),
      links: [
        { to: "/faq", label: t("nav.faq") },
        { to: "/privacy", label: t("footer.privacy") },
        { to: "/terms", label: t("footer.terms") },
      ],
    },
  ];

  const socials = [
    { label: "LinkedIn", icon: <Linkedin size={15} /> },
    { label: "TikTok", icon: <Music2 size={15} /> },
    { label: "X", icon: <X size={15} /> },
  ];

  const linkCls =
    "font-normal text-white transition-colors hover:text-voltage-lime text-[clamp(13px,2.5vw,16px)]";

  return (
    <footer>
      <div className="bg-carbon-ink text-white rounded-t-3xl overflow-hidden font-noigrotesk text-base leading-[1.4] tracking-normal">
        <div className="w-full px-5 lg:px-8 pt-20 pb-14 grid lg:grid-cols-[1.05fr_1fr] gap-12">
          <div>
            <h2 className="font-display text-2xl lg:text-3xl leading-[1.05] max-w-md">
              {t("footer.headline")}
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <AppStoreBadge platform="google" variant="hero" />
              <AppStoreBadge platform="apple" variant="hero" />
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="font-mono text-[11px] uppercase tracking-widest text-ash mb-4">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={`${l.to}-${l.label}`}>
                      <Link href={l.to} className={linkCls}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Accordion type="multiple" className="md:hidden">
            {columns.map((col) => (
              <AccordionItem key={col.heading} value={col.heading} className="border-white/10">
                <AccordionTrigger className="font-mono text-[11px] uppercase tracking-widest text-ash py-4 [&>svg]:text-ash">
                  {col.heading}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={`${l.to}-${l.label}`}>
                        <Link href={l.to} className={linkCls}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div aria-hidden className="relative w-full text-center select-none">
          <span
            className="font-anybody font-black uppercase text-voltage-lime whitespace-nowrap inline-block"
            style={{ fontSize: "clamp(12vw, 15vw, 16vw)", lineHeight: 0.72, letterSpacing: "-0.03em" }}
          >
            Sahayatri
          </span>
        </div>

        <div className="w-full px-5 lg:px-8 pb-6 pt-3">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 text-xs text-ash">
            <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
            <div className="flex items-center gap-5">
              <Link href="/about" className="text-ash transition-colors hover:text-white">{t("footer.about")}</Link>
              <Link href="/contact" className="text-ash transition-colors hover:text-white">{t("footer.contact")}</Link>
              <Link href="/faq" className="text-ash transition-colors hover:text-white">{t("footer.faq")}</Link>
            </div>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 text-white/70 transition-colors hover:bg-voltage-lime hover:text-black"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
