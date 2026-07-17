"use client";

const ITEMS = [
  { color: "bg-secondary", label: "Confirmed" },
  {
    color: "bg-[#5b6ea8]",
    label: "Reschedule requested · awaiting admin",
  },
  {
    color: "bg-[#b0454b]",
    label: "Decline requested · awaiting admin",
  },
  { color: "bg-[#8b8f87]", label: "Completed" },
  {
    color: "bg-[#d8d4c6]",
    label: "Outside working hours",
    pattern: true,
  },
  {
    color: "bg-[#f1efe7] border border-[#d8d4c6]",
    label: "Past date · view only",
  },
];

export function ScheduleLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap text-[11px] text-text-light">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className={`w-3 h-3 rounded-sm ${
              item.pattern
                ? "hatch-past"
                : item.color
            }`}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
