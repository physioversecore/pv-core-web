"use client";

const LEGEND_ITEMS = [
  { label: "Booked", bg: "var(--booked, #16332A)", border: "" },
  { label: "Open", bg: "var(--open, #D1E8DF)", border: "" },
  { label: "Off", bg: "var(--off, #FBFBF8)", border: "1px solid var(--border, #E4E0D6)" },
  { label: "Past", bg: "#ECEAE3", border: "" },
  { label: "Blocked", bg: "#F0D5CA", border: "" },
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
