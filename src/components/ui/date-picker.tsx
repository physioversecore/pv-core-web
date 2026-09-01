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
  max?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Show year + month dropdown selectors for quick navigation (ideal for DOB fields). */
  dropdowns?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  className,
  disabled,
  dropdowns,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = toDate(value);
  const minDate = toDate(min);
  const maxDate = toDate(max);

  const currentYear = new Date().getFullYear();
  const fromYear = minDate ? minDate.getFullYear() : currentYear - 100;
  const toYear = maxDate ? maxDate.getFullYear() : currentYear;

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
          captionLayout={dropdowns ? "dropdown" : "label"}
          fromYear={fromYear}
          toYear={toYear}
          onSelect={(day) => {
            if (day) {
              onChange(toDateString(day));
              setOpen(false);
            }
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
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
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
  min,
  placeholder = "Pick a date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const from = toDate(dateFrom);
  const to = toDate(dateTo);
  const minDate = toDate(min);

  const range = from && to ? { from, to } : from ? { from } : undefined;

  const handleSelect = (r: { from?: Date; to?: Date } | undefined) => {
    if (r?.from) onFromChange(toDateString(r.from));
    if (r?.to) onToChange(toDateString(r.to));
    if (r?.from && r?.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-left font-normal transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
            !range && "text-text-light",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-text-light" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, "MMM d, yyyy")} – {format(range.to, "MMM d, yyyy")}
              </>
            ) : (
              format(range.from, "MMM d, yyyy")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) => (minDate ? date < minDate : false)}
        />
      </PopoverContent>
    </Popover>
  );
}
