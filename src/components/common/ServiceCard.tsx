interface ServiceCardProps {
  title: string;
  meta: string;
  desc: string;
}

export function ServiceCard({ title, meta, desc }: ServiceCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-7 transition-all duration-150 hover:-translate-y-px hover:border-white/[0.16] hover:bg-white/[0.03]">
      <h3 className="font-sans text-[15px] font-medium leading-snug text-ink-soft">{title}</h3>
      <p className="mt-1 text-xs text-ink-muted">{meta}</p>
      <p className="mt-auto pt-5 text-[11px] leading-relaxed text-ink-faint">{desc}</p>
    </div>
  );
}
