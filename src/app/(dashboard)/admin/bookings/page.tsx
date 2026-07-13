"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, ArrowLeftRight, Phone, Mail, FileText } from "lucide-react";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { FilterBar, StatusChip, type FilterConfig } from "@/components/tables";
import type { AdminBookingData, AdminBookingTrailEvent } from "@/services/api/admin";

export default function AdminBookingsPage() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "date" });
  const pageSize = 20;

  const { items, total, isLoading } = useAdminBookings({
    search: debouncedSearch,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

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
        ) : items.length === 0 ? (
          <div className="card-soft p-12 text-center">
            <p className="text-sm text-text-muted">{t("common.noResults") ?? "No bookings found."}</p>
          </div>
        ) : (
          items.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
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
