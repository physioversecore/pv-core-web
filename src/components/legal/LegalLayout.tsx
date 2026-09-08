"use client";

import { useLang } from "@/context/i18n";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/Reveal";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export function LegalLayout({
  eyebrow,
  title,
  subtitle,
  updatedLabel,
  sections,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  updatedLabel: string;
  sections: LegalSection[];
}) {
  const { t } = useLang();

  return (
    <PageShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
              <p className="font-mono text-xs uppercase tracking-widest text-text-light mb-0">
                {updatedLabel}
              </p>
            </div>
          </Reveal>

          <div className="mt-4 space-y-16 lg:space-y-20">
            {sections.map((section, i) => (
              <Reveal key={section.heading}>
                <section className="max-w-3xl">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-secondary">{String(i + 1).padStart(2, "0")}</span>
                    <h2
                      className="font-sans font-medium tracking-[-0.02em] text-text"
                      style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.15 }}
                    >
                      {section.heading}
                    </h2>
                  </div>
                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className="mt-4 text-[15px] leading-[1.8] text-text-light">
                      {p}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-3 text-[15px] leading-[1.7] text-text-light">
                          <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-voltage-lime" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-20 rounded-[24px] bg-mid-abyss p-8 lg:p-10 lg:rounded-[28px]">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-voltage-lime shrink-0" />
                <Link
                  href="mailto:care@sahayatriphysio.com"
                  className="text-[15px] font-medium text-white underline-offset-4 hover:underline"
                >
                  care@sahayatriphysio.com
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Phone size={18} className="text-voltage-lime shrink-0" />
                <a href="tel:+97715550199" className="text-[15px] text-white/70 hover:text-white">
                  +977 1 555 0199
                </a>
              </div>
              <p className="mt-6 text-[13px] text-white/50">{t("legal.lastUpdatedLabel")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}