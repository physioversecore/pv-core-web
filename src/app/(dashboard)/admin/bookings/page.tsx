"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  ArrowLeftRight,
  Phone,
  Mail,
  FileText,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { FilterBar, StatusChip, type FilterConfig } from "@/components/tables";
import BookingModal from "@/components/booking/BookingModal";
import type { AdminBookingData, AdminBookingTrailEvent } from "@/services/api/admin";
import type { AdminBookingResult } from "@/components/booking/types";

function notifyBookingParties(booking: AdminBookingResult) {
  const dateStr = new Date(booking.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  toast.success(
    `Notified ${booking.patientName}: Your session with ${booking.therapistName} on ${dateStr} at ${booking.time} is confirmed.`,
  );

  setTimeout(() => {
    toast.info(
      `Notified ${booking.therapistName}: New session booked with ${booking.patientName} on ${dateStr} at ${booking.time}.`,
    );
  }, 600);
}

function buildAdminBookingFromResult(result: AdminBookingResult): AdminBookingData {
  const dateStr = new Date(result.date).toISOString().slice(0, 10);
  return {
    id: result.reference,
    patient: result.patientName,
    patientId: result.patientId,
    patientPhone: result.patientPhone,
    patientEmail: result.patientEmail,
    therapist: result.therapistName,
    therapistId: result.therapistId,
    therapistPhone: result.therapistPhone,
    therapistEmail: result.therapistEmail,
    date: dateStr,
    originalTime: result.time,
    sessionType: "Physiotherapy session",
    status: "Confirmed",
    paymentStatus: "Pending",
    paymentMethod: result.paymentMethod,
    trail: [
      {
        id: "evt-new-" + result.reference,
        type: "confirmed",
        timestamp: new Date().toISOString(),
        description: `Session booked by admin — ${result.patientName} with ${result.therapistName} on ${dateStr} at ${result.time}.${result.paymentMethod ? ` Payment via ${result.paymentMethod}.` : ""}`,
        dotColor: "secondary",
      },
    ],
  };
}

export default function AdminBookingsPage() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [adminBookings, setAdminBookings] = useState<AdminBookingData[]>([]);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "date" });
  const pageSize = 20;

  const { items: apiItems, total: apiTotal, isLoading, isRefetching, refetch } = useAdminBookings({
    search: debouncedSearch,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const allItems = useMemo(() => {
    const combined = [...adminBookings, ...apiItems];
    let result = combined;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.patient.toLowerCase().includes(q) ||
          r.therapist.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    if (dateFrom) {
      result = result.filter((r) => r.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.date <= dateTo);
    }

    return result;
  }, [adminBookings, apiItems, debouncedSearch, status, dateFrom, dateTo]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, status, dateFrom, dateTo }),
    [search, status, dateFrom, dateTo],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "status") setStatus(value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      setPage(1);
    },
    [],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.patient") ?? "Patient",
        placeholder: "Search by patient, therapist, or booking ID…",
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: t("admin_dashboard.allStatuses") ?? "All statuses",
        options: [
          { value: "Confirmed", label: t("admin_dashboard.confirmed") ?? "Confirmed" },
          { value: "Cancelled", label: t("admin_dashboard.cancelled") ?? "Cancelled" },
          { value: "Rescheduled", label: "Rescheduled" },
        ],
      },
      { key: "dateFrom", type: "date", label: t("admin_dashboard.dateTime") ?? "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [t],
  );

  const handleBookingCreated = useCallback((result: AdminBookingResult) => {
    const newBooking = buildAdminBookingFromResult(result);
    setAdminBookings((prev) => [newBooking, ...prev]);
    notifyBookingParties(result);
  }, []);

  return (
    <div className="space-y-4">
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl">{t("admin_dashboard.allBookings") ?? "Bookings"}</h3>
            <p className="text-sm text-text-light mt-1">
              Cancellations and reschedules update the therapist&apos;s calendar instantly and notify both sides.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3D2B] text-white text-sm font-semibold hover:bg-[#1F3D2B]/90 transition-colors shrink-0"
            >
              <Plus size={16} />
              Book Session
            </button>
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-soft p-5 animate-pulse">
              <div className="h-4 w-64 bg-surface rounded mb-3" />
              <div className="h-3 w-48 bg-surface rounded mb-2" />
              <div className="h-3 w-32 bg-surface rounded" />
            </div>
          ))
        ) : allItems.length === 0 ? (
          <div className="card-soft p-12 text-center">
            <p className="text-sm text-text-muted">{t("common.noResults") ?? "No bookings found."}</p>
          </div>
        ) : (
          allItems.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>

      {showBookingModal && (
        <BookingModal
          mode="admin"
          onClose={() => setShowBookingModal(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: AdminBookingData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-soft overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left cursor-pointer hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-medium text-sm">
                {booking.patient}
              </span>
              <ArrowLeftRight size={14} className="text-text-muted shrink-0" />
              <span className="font-medium text-sm">
                {booking.therapist}
              </span>
              <span className="font-mono text-[0.65rem] text-text-muted ml-auto hidden sm:inline">
                {booking.id}
              </span>
            </div>
            <div className="text-xs text-text-light">
              {booking.date === "2026-07-12" ? "Today" : booking.date} · Originally {booking.originalTime} · {booking.sessionType}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusChip status={booking.status} />
            {expanded ? (
              <ChevronDown size={16} className="text-text-muted" />
            ) : (
              <ChevronRight size={16} className="text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dashed border-border px-5 pb-5 pt-4 space-y-4">
          <BookingTrail trail={booking.trail} />

          <div className="border-t border-border pt-4">
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">
              Session Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-text-muted" />
                <div>
                  <div className="text-[0.65rem] uppercase font-mono text-text-light">Patient contact</div>
                  <div className="text-text">{booking.patientPhone ?? "—"}</div>
                  <div className="text-text-light text-xs">{booking.patientEmail ?? "—"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-text-muted" />
                <div>
                  <div className="text-[0.65rem] uppercase font-mono text-text-light">Therapist contact</div>
                  <div className="text-text">{booking.therapistPhone ?? "—"}</div>
                  <div className="text-text-light text-xs">{booking.therapistEmail ?? "—"}</div>
                </div>
              </div>
              {booking.paymentStatus && (
                <div>
                  <div className="text-[0.65rem] uppercase font-mono text-text-light">Payment</div>
                  <StatusChip status={booking.paymentStatus} />
                </div>
              )}
              {booking.paymentMethod && (
                <div>
                  <div className="text-[0.65rem] uppercase font-mono text-text-light">Payment method</div>
                  <div className="text-sm text-text capitalize">{booking.paymentMethod}</div>
                </div>
              )}
              {booking.sessionNotes && (
                <div className="sm:col-span-2">
                  <div className="text-[0.65rem] uppercase font-mono text-text-light flex items-center gap-1 mb-1">
                    <FileText size={12} /> Session notes
                  </div>
                  <p className="text-sm text-text-light bg-surface rounded-xl p-3">{booking.sessionNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingTrail({ trail }: { trail: AdminBookingTrailEvent[] }) {
  return (
    <div>
      <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-3">
        History
      </span>
      <div className="relative ml-2">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-3">
          {trail.map((evt) => (
            <div key={evt.id} className="flex gap-3 relative">
              <div
                className={`w-[11px] h-[11px] rounded-full border-2 border-background shrink-0 mt-0.5 z-10 ${
                  evt.dotColor === "danger"
                    ? "bg-destructive"
                    : "bg-secondary"
                }`}
              />
              <div className="text-sm text-text-light leading-relaxed">
                {evt.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
