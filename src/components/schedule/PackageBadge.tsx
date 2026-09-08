"use client";

import { Package } from "lucide-react";

export function PackageBadge({ name }: { name?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
      title={name ? `Booked via ${name}` : "Booked via package"}
    >
      <Package size={9} className="shrink-0" />
      Package
    </span>
  );
}
