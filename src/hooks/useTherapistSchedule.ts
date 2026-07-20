"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSessions, updateSession } from "@/services/api/sessions";
import { getWorkingHours } from "@/services/api/availability";
import { getMyTherapist } from "@/services/api/therapists";
import type { WorkingHours } from "@/lib/availability-utils";

export type ScheduleAppointmentStatus =
  | "confirmed"
  | "reschedule_requested"
  | "decline_requested"
  | "completed";

export interface ScheduleAppointment {
  id: string;
  patient: string;
  patientId?: string;
  date: string;
  time: string;
  type: string;
  status: ScheduleAppointmentStatus;
  address: string;
  phone?: string;
  fee?: number;
  requestPending?: boolean;
  requestReason?: string;
  notes?: string;
}

const STATUS_MAP: Record<string, ScheduleAppointmentStatus> = {
  confirmed: "confirmed",
  pending: "confirmed",
  SCHEDULED: "confirmed",
  IN_PROGRESS: "confirmed",
  completed: "completed",
  COMPLETED: "completed",
  reschedule_requested: "reschedule_requested",
  RESCHEDULE_REQUESTED: "reschedule_requested",
  decline_requested: "decline_requested",
  DECLINE_REQUESTED: "decline_requested",
};

function toLocalDateKey(raw: string): string {
  const d = new Date(raw);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mapSessionToAppointment(
  s: { id: string; patientId: string; patientName?: string; patientPhone?: string; date: string; time: string; type: string; status: string; address: string; fee?: number; notes?: string; therapistId?: string; therapistName?: string },
): ScheduleAppointment {
  return {
    id: s.id,
    patient: s.patientName || s.notes?.split("|")[1]?.trim() || s.patientId,
    patientId: s.patientId,
    date: toLocalDateKey(s.date),
    time: s.time,
    type: s.type,
    status: STATUS_MAP[s.status] ?? "confirmed",
    address: s.address,
    phone: s.patientPhone || s.notes?.split("|")[2]?.trim(),
    fee: s.fee,
    requestPending: s.status === "RESCHEDULE_REQUESTED" || s.status === "DECLINE_REQUESTED",
    requestReason: s.notes?.split("|")[0]?.trim(),
    notes: s.notes,
  };
}

export function useTherapistSchedule(
  userId?: string | null,
  startDate?: string,
  endDate?: string,
) {
  const queryClient = useQueryClient();

  const { data: myTherapist, isLoading: therapistLoading } = useQuery({
    queryKey: ["my-therapist"],
    queryFn: getMyTherapist,
    enabled: !!userId,
  });

  const therapistId = myTherapist?.id;

  const { data: workingHours, isLoading: whLoading } = useQuery({
    queryKey: ["availability", "working-hours"],
    queryFn: getWorkingHours,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["therapist-schedule", therapistId, startDate, endDate],
    queryFn: () =>
      getSessions({
        therapistId: therapistId ?? undefined,
        startDate,
        endDate,
      }),
    enabled: !!therapistId,
  });

  const appointments: ScheduleAppointment[] = (data?.sessions ?? []).map(mapSessionToAppointment);

  const requestReschedule = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return updateSession(id, {
        status: "RESCHEDULE_REQUESTED",
        notes: `${reason}|`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-schedule"] });
      toast.success("Reschedule request sent to admin");
    },
    onError: () => toast.error("Failed to send reschedule request"),
  });

  const requestDecline = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return updateSession(id, {
        status: "DECLINE_REQUESTED",
        notes: `${reason}|`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist-schedule"] });
      toast.success("Decline request sent to admin");
    },
    onError: () => toast.error("Failed to send decline request"),
  });

  return {
    appointments,
    workingHours: workingHours ?? ({ start: "08:00", end: "18:00", slotInterval: 60, sessionDuration: 60, breakDuration: 0, daysOfWeek: [] } as WorkingHours),
    isLoading: isLoading || whLoading || therapistLoading,
    requestReschedule: requestReschedule.mutateAsync,
    requestDecline: requestDecline.mutateAsync,
    isRequesting: requestReschedule.isPending || requestDecline.isPending,
  };
}
