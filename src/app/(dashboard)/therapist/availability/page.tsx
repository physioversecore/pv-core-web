"use client";

import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useManageAvailability } from "@/hooks/useManageAvailability";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { ScheduleBuilder } from "@/components/availability/ScheduleBuilder";
import { DailyView } from "@/components/availability/DailyView";
import { WeeklyView } from "@/components/availability/WeeklyView";
import { MonthlyView } from "@/components/availability/MonthlyView";
import { AuditLog } from "@/components/availability/AuditLog";
import { BlockRequestsList } from "@/components/availability/BlockRequestsList";
import { Legend } from "@/components/availability/Legend";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "daily" | "weekly" | "monthly";

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

function formatCursorLabel(view: ViewMode, cursor: string): string {
  const d = new Date(cursor + "T00:00:00");
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  switch (view) {
    case "daily":
      return isToday
        ? `Today · ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
    case "weekly": {
      const start = new Date(d);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    case "monthly":
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
}

export default function ManageAvailabilityPage() {
  const { user } = useAuth();
  const av = useManageAvailability(user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Schedule</p>
          <h1 className="text-[30px] font-display text-text font-semibold">
            Manage availability
          </h1>
        </div>
        <RefreshButton onRefresh={() => av.refetch()} isRefreshing={av.isRefetching} />
      </div>

      {/* Schedule builder + Audit log side by side (large screens only) */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-[70%]">
          <ScheduleBuilder
            builderMode={av.builderMode}
            setBuilderMode={av.setBuilderMode}
            scheduleConfig={av.scheduleConfig}
            setScheduleConfig={av.setScheduleConfig}
            blockConfig={av.blockConfig}
            setBlockConfig={av.setBlockConfig}
            applyPreset={av.applyPreset}
            workingDays={av.workingDays}
            generateAvailability={av.generateAvailability}
            isGenerating={av.isGenerating}
            hasConfigChanged={av.hasConfigChanged}
            blockRange={av.blockRange}
            isBlocking={av.isBlocking}
            blockRequest={av.blockRequest}
            isRequestingBlock={av.isRequestingBlock}
            hasBookedSlotsInRange={av.hasBookedSlotsInRange}
          />
        </div>
        <div className="hidden w-full lg:block lg:w-[30%]">
          <div className="card-proto lg:sticky lg:top-6">
            <h2>Recent blocks</h2>
            <AuditLog
              entries={av.auditLog}
              total={av.auditTotal}
              page={av.auditPage}
              limit={av.auditLimit}
              onPageChange={av.setAuditPage}
              onDelete={av.deleteAuditEntry}
              onUnblock={av.unblockTime}
              isUnblocking={av.isUnblocking}
            />
          </div>
        </div>
      </div>

      {/* View tabs + date nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="proto-segmented">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => av.setView(tab.key)}
              className={av.view === tab.key ? "active" : ""}
            >
              {tab.label}
            </button>
          ))}
        </div>
   {/* Legend */}
      <Legend />
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => av.navigateCursor("prev")}
            className="proto-nav-btn"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[13px] font-semibold tracking-wide text-text">
            {formatCursorLabel(av.view, av.cursor)}
          </span>
          <button
            onClick={() => av.navigateCursor("next")}
            className="proto-nav-btn"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Calendar view */}

      {av.isLoading ? (
        <div className="card-proto space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : av.view === "daily" ? (
        <DailyView
          date={av.cursor}
          slots={av.slotsByDate[av.cursor] ?? []}
          isBlocked={av.blockedDates.has(av.cursor)}
          blockedPartsByDate={av.blockedPartsByDate}
          sessionDuration={av.scheduleConfig.sessionDuration}
          onToggleSlot={av.toggleSlot}
          onUnblock={av.unblockTime}
          onBlockDay={av.blockRange}
          isToggling={av.isToggling}
          isUnblocking={av.isUnblocking}
          isBlocking={av.isBlocking}
        />
      ) : av.view === "weekly" ? (
        <WeeklyView
          dateFrom={av.dateFrom}
          slotsByDate={av.slotsByDate}
          blockedDates={av.blockedDates}
          blockedPartsByDate={av.blockedPartsByDate}
          sessionDuration={av.scheduleConfig.sessionDuration}
          onToggleSlot={av.toggleSlot}
          onUnblock={av.unblockTime}
          isToggling={av.isToggling}
          isUnblocking={av.isUnblocking}
        />
      ) : (
        <MonthlyView
          cursor={av.cursor}
          slotsByDate={av.slotsByDate}
          blockedDates={av.blockedDates}
          blockedPartsByDate={av.blockedPartsByDate}
          sessionDuration={av.scheduleConfig.sessionDuration}
          onToggleSlot={av.toggleSlot}
          onUnblock={av.unblockTime}
          isToggling={av.isToggling}
          isUnblocking={av.isUnblocking}
        />
      )}

      {/* Audit log — small screens only (below calendar) */}
      <div className="block lg:hidden">
        <div className="card-proto">
          <h2>Recent blocks</h2>
          <AuditLog
            entries={av.auditLog}
            total={av.auditTotal}
            page={av.auditPage}
            limit={av.auditLimit}
            onPageChange={av.setAuditPage}
            onDelete={av.deleteAuditEntry}
            onUnblock={av.unblockTime}
            isUnblocking={av.isUnblocking}
          />
        </div>
      </div>

      {/* Block requests */}
      {av.blockRequests.length > 0 && (
        <div className="card-proto">
          <h2>Block requests</h2>
          <BlockRequestsList requests={av.blockRequests} />
        </div>
      )}
    </div>
  );
}
