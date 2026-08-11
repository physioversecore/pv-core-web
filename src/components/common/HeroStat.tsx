interface HeroStatProps {
  value: string;
  label: string;
}

export function HeroStat({ value, label }: HeroStatProps) {
  return (
    <div>
      <div className="font-display font-extrabold text-3xl md:text-4xl text-white">{value}</div>
      <div className="text-[11px] text-white/70 mt-1 font-mono font-bold uppercase tracking-widest">{label}</div>
    </div>
  );
}
