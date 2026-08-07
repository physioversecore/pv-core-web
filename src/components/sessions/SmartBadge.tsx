"use client";

import { isToday, isTomorrow, isPast, hoursUntil } from "@/lib/format";

interface SmartBadgeProps {
  date: string;
  time: string;
  status: string;
}

export function SmartBadge({ date, time, status }: SmartBadgeProps) {
  if (status !== "SCHEDULED" && status !== "IN_PROGRESS") return null;

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] bg-amber/15 text-amber">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        In Progress
      </span>
    );
  }

  if (isPast(date, time)) {
    return (
      <span className="text-[10px] badge-danger">
        Overdue
      </span>
    );
  }

  if (isToday(date)) {
    const h = hoursUntil(date, time);
    return (
      <>
        {h <= 2 && (
          <span className={`badge-warning text-[10px] animate-pulse`}>
            Due soon
          </span>
        )}
    </>
    );
  }

  if (isTomorrow(date)) {
    return (
      <span className="badge-success text-[10px]">
        Tomorrow
      </span>
    );
  }

  return null;
}
