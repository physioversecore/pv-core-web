"use client";

import { useQuery } from "@tanstack/react-query";
import { getSessions } from "@/services/api/sessions";
import type { SessionData } from "@/services/api/sessions";

export interface ScheduleAppointment {
  id: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  patient: string;
  phone: string;
  address: string;
  type: "home_visit" | "follow_up" | "assessment";
  fee: number;
}

function mapStatus(raw: string): ScheduleAppointment["status"] {
  switch (raw.toUpperCase()) {
    case "SCHEDULED":
    case "CONFIRMED":
      return "confirmed";
    case "PENDING":
      return "pending";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}

function mapType(raw: string): ScheduleAppointment["type"] {
  switch (raw.toLowerCase()) {
    case "home_visit":
    case "home-visit":
      return "home_visit";
    case "follow_up":
    case "follow-up":
      return "follow_up";
    case "assessment":
      return "assessment";
    default:
      return "home_visit";
  }
}

function sessionsToAppointments(sessions: SessionData[]): ScheduleAppointment[] {
  return sessions.map((s) => ({
    id: s.id,
    date: s.date,
    time: s.time,
    status: mapStatus(s.status),
    patient: s.patientId,
    phone: "",
    address: s.address || "",
    type: mapType(s.type),
    fee: s.fee,
  }));
}

export function useTherapistSchedule(
  therapistId: string | null,
  startDate: string,
  endDate: string,
) {
  const { data, isLoading } = useQuery({
    queryKey: ["therapist-schedule", therapistId, startDate, endDate],
    queryFn: () =>
      getSessions({
        therapistId: therapistId!,
        startDate,
        endDate,
        limit: 200,
      }),
    enabled: !!therapistId,
  });

  const appointments: ScheduleAppointment[] = sessionsToAppointments(
    data?.sessions ?? [],
  );

  return { appointments, isLoading, total: data?.total ?? 0 };
}
