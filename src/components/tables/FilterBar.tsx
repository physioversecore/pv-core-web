"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker";
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
  type: "search" | "select" | "date" | "datetime" | "daterange";
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  colSpan?: number;
  fromKey?: string;
  toKey?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onRangeChange?: (fromKey: string, fromValue: string, toKey: string, toValue: string) => void;
  onClear: () => void;
  expandable?: boolean;
}

function FilterControl({
  filter,
  values,
  onChange,
  onRangeChange,
}: {
  filter: FilterConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onRangeChange?: (fromKey: string, fromValue: string, toKey: string, toValue: string) => void;
}) {
  if (filter.type === "datetime") {
    const timeKey = `${filter.key}Time`;
    return (
      <div className="flex flex-col gap-1.5 min-w-0">
        <label className="text-[0.65rem] uppercase font-mono text-text-light">
          {filter.label}
        </label>
        <div className="flex items-center gap-2">
          <DatePicker
            value={values[filter.key] || null}
            onChange={(date) => onChange(filter.key, date)}
            placeholder="Select date"
            className="w-40 rounded-full h-9 text-sm"
          />
          <div className="relative">
            <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
            <input
              type="time"
              value={values[timeKey] ?? ""}
              onChange={(e) => onChange(timeKey, e.target.value)}
              className="h-9 w-28 rounded-full border border-border bg-white pl-8 pr-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    );
  }

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
        <DatePicker
          value={values[filter.key] || null}
          onChange={(date) => onChange(filter.key, date)}
          placeholder={filter.placeholder ?? "Pick a date"}
          className="w-44 rounded-full h-9 text-sm"
        />
      )}
      {filter.type === "daterange" && (
        <DateRangePicker
          dateFrom={values[filter.fromKey ?? `${filter.key}From`] || null}
          dateTo={values[filter.toKey ?? `${filter.key}To`] || null}
          onFromChange={(date) => {
            const fromKey = filter.fromKey ?? `${filter.key}From`;
            const toKey = filter.toKey ?? `${filter.key}To`;
            if (onRangeChange) onRangeChange(fromKey, date, toKey, values[toKey] ?? "");
            else onChange(fromKey, date);
          }}
          onToChange={(date) => {
            const fromKey = filter.fromKey ?? `${filter.key}From`;
            const toKey = filter.toKey ?? `${filter.key}To`;
            if (onRangeChange) onRangeChange(fromKey, values[fromKey] ?? "", toKey, date);
            else onChange(toKey, date);
          }}
          className="w-64 rounded-full h-9 text-sm"
        />
      )}
    </div>
  );
}

export function FilterBar({ filters, values, onChange, onRangeChange, onClear, expandable }: FilterBarProps) {
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
            <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} onRangeChange={onRangeChange} />
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
              <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} onRangeChange={onRangeChange} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      {filters.map((filter) => (
        <FilterControl key={filter.key} filter={filter} values={values} onChange={onChange} onRangeChange={onRangeChange} />
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
