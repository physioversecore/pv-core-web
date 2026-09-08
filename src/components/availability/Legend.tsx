"use client";

const LEGEND_ITEMS = [
  { label: "Booked", bg: "var(--booked, var(--color-slot-booked))", border: "" },
  { label: "Open", bg: "var(--open, var(--color-slot-open))", border: "" },
  { label: "Off", bg: "var(--off, var(--color-slot-off))", border: "1px solid var(--border, var(--color-slot-past-alt))" },
  { label: "Past", bg: "var(--color-slot-past)", border: "" },
  { label: "Blocked", bg: "var(--color-slot-blocked)", border: "" },
] as const;

export function Legend() {
  return (
    <div className="proto-legend">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label}>
          <i
            className="proto-sw"
            style={{
              background: item.bg,
              ...(item.border ? { border: item.border } : {}),
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
