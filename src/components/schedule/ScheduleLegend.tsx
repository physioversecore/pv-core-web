"use client";

const ITEMS = [
  { color: "bg-secondary", label: "Confirmed" },
  {
    color: "bg-session-reschedule",
    label: "Reschedule requested · awaiting admin",
  },
  {
    color: "bg-session-decline",
    label: "Decline requested · awaiting admin",
  },
  { color: "bg-session-completed", label: "Completed" },
  {
    color: "bg-slot-off-border",
    label: "Outside working hours",
    pattern: true,
  },
  {
    color: "bg-session-past-bg border border-slot-off-border",
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
