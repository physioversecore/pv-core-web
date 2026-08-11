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
    <section className="pt-40 pb-16 relative overflow-hidden bg-moss text-white grid-bg rounded-b-3xl border-b-4 border-carbon">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-90 h-90 rounded-full bg-volt/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full bg-mint/20 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        {eyebrow && <p className="label-ink !text-volt mb-3">{eyebrow}</p>}
        <h1 className="font-display font-extrabold uppercase text-4xl md:text-6xl leading-[0.9] tracking-tighter max-w-3xl">{title}</h1>
        {subtitle && <p className="text-white/80 text-lg mt-5 max-w-2xl">{subtitle}</p>}
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
