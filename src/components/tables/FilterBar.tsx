"use client";

import { useState } from "react";
import { Search, X, Calendar, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/context/i18n";

export interface FilterConfig {
  key: string;
  type: "search" | "select" | "date";
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  colSpan?: number;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  expandable?: boolean;
}

function FilterControl({
  filter,
  values,
  onChange,
}: {
  filter: FilterConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className="text-[0.65rem] uppercase font-mono text-text-light">
        {filter.label}
      </label>
      {filter.type === "search" && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <Input
            value={values[filter.key] ?? ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="pl-9 pr-3 py-2 h-9 rounded-full border-border bg-background text-sm w-56"
          />
        </div>
      )}
      {filter.type === "select" && (
        <Select value={values[filter.key] ?? ""} onValueChange={(v) => onChange(filter.key, v)}>
          <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
            <SelectValue placeholder={filter.placeholder ?? filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {filter.type === "date" && (
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
          <Input
            type="date"
            value={values[filter.key] ?? ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="pl-9 pr-3 py-2 h-9 rounded-full border-border bg-background text-sm w-44"
          />
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, values, onChange, onClear, expandable }: FilterBarProps) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = Object.values(values).some((v) => v !== "");

  const searchFilters = filters.filter((f) => f.type === "search");
  const otherFilters = filters.filter((f) => f.type !== "search");

  if (expandable) {
    return (
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          {searchFilters.map((filter) => (
            <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} />
          ))}

          <div className="flex items-end gap-2">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                expanded || hasActiveFilters
                  ? "bg-secondary text-white"
                  : "text-text-light hover:text-text hover:bg-muted"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium text-text-light hover:text-text hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={12} />
                {t("admin_dashboard.clearFilters") ?? "Clear filters"}
              </button>
            )}
          </div>
        </div>

        {expanded && otherFilters.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 pl-1">
            {otherFilters.map((filter) => (
              <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      {filters.map((filter) => (
        <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} />
      ))}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium text-text-light hover:text-text hover:bg-muted transition-colors cursor-pointer"
        >
          <X size={12} />
          {t("admin_dashboard.clearFilters") ?? "Clear filters"}
        </button>
      )}
    </div>
  );
}
