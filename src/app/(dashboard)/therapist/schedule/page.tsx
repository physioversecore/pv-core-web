"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useTherapistSchedule } from "@/hooks/useTherapistSchedule";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import type { ScheduleAppointment } from "@/hooks/useTherapistSchedule";

export default function TherapistSchedulePage() {
  const { user } = useAuth();

  const {
    appointments,
    workingHours,
    isLoading,
    isRefetching,
    refetch,
    requestReschedule,
    requestDecline,
    isRequesting,
  } = useTherapistSchedule(user?.id);

  const handleRequestReschedule = useCallback(
    async (apt: ScheduleAppointment) => {
      await requestReschedule({ id: apt.id, reason: "" });
    },
    [requestReschedule]
  );

  const handleRequestDecline = useCallback(
    async (apt: ScheduleAppointment) => {
      await requestDecline({ id: apt.id, reason: "" });
    },
    [requestDecline]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Schedule</p>
          <h1 className="text-[30px] font-display text-text font-semibold">
            My schedule
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
        </div>
      </div>

      <ScheduleCalendar
        appointments={appointments}
        workingHours={workingHours}
        isLoading={isLoading}
        onRequestReschedule={handleRequestReschedule}
        onRequestDecline={handleRequestDecline}
      />
    </div>
  );
}
