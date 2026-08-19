"use client";

import { cn } from "@/utils/cn";

export function StepProgress({
  steps,
  current,
}: {
  steps: { label: string }[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-8 -ml-1">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors",
                done && "bg-voltage-lime text-[#0a1815]",
                active && "bg-[#14151c] text-white",
                !done && !active && "bg-border text-text-muted/50"
              )}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:inline",
                active ? "text-text" : "text-text-muted/50"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-border mx-1 hidden sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
