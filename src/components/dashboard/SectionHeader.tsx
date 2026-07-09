import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        {subtitle && <p className="eyebrow mb-1">{subtitle}</p>}
        <h3 className="section-title">{title}</h3>
      </div>
      {action}
    </div>
  );
}
