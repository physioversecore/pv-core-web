"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/hooks/useTableSort";

interface SortableHeaderProps {
  label: string;
  column: string;
  activeColumn: string;
  direction: SortDirection;
  onToggle: (column: string) => void;
  className?: string;
}

export function SortableHeader({ label, column, activeColumn, direction, onToggle, className }: SortableHeaderProps) {
  const isActive = activeColumn === column;

  return (
    <th
      className={cn(
        "py-2 pr-3 text-[0.65rem] uppercase font-mono text-text-light text-left select-none",
        isActive && "!text-text",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(column)}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-text transition-colors"
      >
        {label}
        {isActive ? (
          direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}
