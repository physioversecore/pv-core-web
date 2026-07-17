"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type ViewMode = "daily" | "weekly" | "monthly";

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

interface ViewSwitcherProps {
  view: ViewMode;
  rangeLabel: string;
  onViewChange: (v: ViewMode) => void;
  onNav: (dir: number) => void;
}

export function ViewSwitcher({ view, rangeLabel, onViewChange, onNav }: ViewSwitcherProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
      <div className="inline-flex border border-border rounded-full p-[3px] bg-white">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onViewChange(opt.key)}
            className={cn(
              "px-4 py-[7px] rounded-full text-xs font-semibold transition-all duration-150 border border-transparent",
              view === opt.key
                ? "bg-background text-text border-border"
                : "bg-transparent text-text-light hover:text-text"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNav(-1)}
          className="w-[30px] h-[30px] flex items-center justify-center border border-border bg-white rounded-lg text-text-light hover:text-text cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] font-semibold tracking-wide">{rangeLabel}</span>
        <button
          onClick={() => onNav(1)}
          className="w-[30px] h-[30px] flex items-center justify-center border border-border bg-white rounded-lg text-text-light hover:text-text cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
