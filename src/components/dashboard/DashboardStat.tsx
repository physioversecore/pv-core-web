import type { ReactNode } from "react";

interface DashboardStatProps {
  label: string;
  value: string | ReactNode;
  sub?: string;
  variant?: "default" | "amber";
}

export function DashboardStat({ label, value, sub, variant = "default" }: DashboardStatProps) {
  return (
    <div className={`card-soft p-5 ${variant === "amber" ? "card-highlight" : ""}`}>
      <div className="eyebrow mb-2">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="text-xs text-text-light mt-1.5">{sub}</div>}
    </div>
  );
}
