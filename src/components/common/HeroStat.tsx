interface HeroStatProps {
  value: string;
  label: string;
}

export function HeroStat({ value, label }: HeroStatProps) {
  return (
    <div>
      <div className="font-display text-3xl text-white">{value}</div>
      <div className="text-[11px] text-white/60 mt-1 font-mono uppercase tracking-widest">{label}</div>
    </div>
  );
}
