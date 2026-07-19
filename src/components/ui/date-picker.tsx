"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toDate(dateStr: string | null | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

function toDateString(date: Date | undefined): string {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface DatePickerProps {
  value: string | null | undefined;
  onChange: (date: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = toDate(value);
  const minDate = toDate(min);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-left font-normal transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-text-light",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-text-light" />
          {selected ? format(selected, "MMM d, yyyy") : <span>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(toDateString(day));
              setOpen(false);
            }
          }}
          disabled={(date) => (minDate ? date < minDate : false)}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateFrom: string | null | undefined;
  dateTo: string | null | undefined;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  min?: string;
  className?: string;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
  min,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DatePicker value={dateFrom} onChange={onFromChange} min={min} placeholder="From" className="flex-1" />
      <span className="text-text-light text-sm">to</span>
      <DatePicker value={dateTo} onChange={onToChange} min={min} placeholder="To" className="flex-1" />
    </div>
  );
}
