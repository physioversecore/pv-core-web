import type { ReactNode } from "react";

export function PageHero({
  title,
  eyebrow,
  subtitle,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
}) {
  return (
    <section
      className="pt-36 pb-24 relative overflow-hidden text-white"
      style={{ background: "#052326" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 section-blend-bottom"
        style={{
          background:
            "radial-gradient(58rem 32rem at 25% 10%, rgba(122,243,255,0.16) 0%, rgba(122,243,255,0) 55%)," +
            "radial-gradient(62rem 36rem at 78% 20%, rgba(211,251,82,0.14) 0%, rgba(211,251,82,0) 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(180deg, transparent 0%, var(--color-background) 100%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        {eyebrow && <p className="eyebrow !text-white/70 mb-3">{eyebrow}</p>}
        <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl">{title}</h1>
        {subtitle && <p className="text-white/70 text-lg mt-4 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}

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
    <>
      <PageHero title={title} eyebrow={eyebrow} subtitle={subtitle} />
      <main>{children}</main>
    </>
  );
}
