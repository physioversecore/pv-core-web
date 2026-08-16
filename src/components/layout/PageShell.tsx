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
    <section className="pt-36 pb-24 relative overflow-hidden text-white">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        {eyebrow && (
          <div className="flex items-center gap-2.5 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-voltage-lime" />
            <p className="eyebrow !text-white/70 mb-0">{eyebrow}</p>
          </div>
        )}
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
    <div
      className="relative min-h-screen"
      style={{
        background:
          "radial-gradient(58rem 32rem at 28% 6%, color-mix(in srgb, var(--color-abyss-deep) 16%, transparent) 0%, transparent 55%)," +
          "radial-gradient(62rem 36rem at 72% 10%, color-mix(in srgb, var(--color-voltage-lime) 14%, transparent) 0%, transparent 55%)," +
          "linear-gradient(180deg, var(--color-abyss-soft) 0%, var(--color-background) 45%, var(--color-pure-white) 100%)",
      }}
    >
      <PageHero title={title} eyebrow={eyebrow} subtitle={subtitle} />
      <main>{children}</main>
    </div>
  );
}
