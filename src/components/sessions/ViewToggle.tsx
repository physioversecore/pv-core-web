"use client";

import { LayoutList, LayoutGrid, Table2 } from "lucide-react";

export type ViewMode = "list" | "grid" | "compact";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

const views: { key: ViewMode; icon: typeof LayoutList; label: string }[] = [
  // { key: "list", icon: LayoutList, label: "List" },
  { key: "grid", icon: LayoutGrid, label: "Grid" },
  { key: "compact", icon: Table2, label: "Compact" },
];

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-0.5 bg-surface rounded-lg border border-border">
      {views.map((v) => {
        const Icon = v.icon;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
              view === v.key
                ? "bg-white text-secondary shadow-sm"
                : "text-text-light hover:text-text"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
