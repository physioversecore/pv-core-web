"use client";

const ITEMS = [
  { label: "Booked", className: "bg-slot-booked" },
  { label: "Open", className: "bg-slot-open" },
  { label: "Off", className: "bg-slot-off border border-border" },
  { label: "Past", className: "hatch-past" },
  { label: "Blocked", className: "hatch-blocked" },
] as const;

export function Legend() {
  return (
    <div className="flex gap-4 text-xs text-text-light flex-wrap mt-3">
      {ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <i className={`inline-block w-[11px] h-[11px] rounded-[3px] ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
