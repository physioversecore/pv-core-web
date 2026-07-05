import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({
  title,
  eyebrow,
  subtitle,
  children,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text">
      <SiteHeader variant="solid" />
      <section className="pt-28 pb-14 relative overflow-hidden" style={{ background: "linear-gradient(180deg,#F0F5F1 0%,var(--color-background) 100%)" }}>
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-[360px] h-[360px] rounded-full bg-secondary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full bg-primary/15 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">{title}</h1>
          {subtitle && <p className="text-text-light text-lg mt-4 max-w-2xl">{subtitle}</p>}
        </div>
      </section>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
