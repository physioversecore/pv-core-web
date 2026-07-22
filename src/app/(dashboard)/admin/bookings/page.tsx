"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useBookingBadge } from "@/context/booking-badge";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import BookingModal from "@/components/booking/BookingModal";
import type { AdminBookingData } from "@/services/api/admin";
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
  const { resetBookingCount } = useBookingBadge();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [optimisticBookings, setOptimisticBookings] = useState<AdminBookingData[]>([]);

  useEffect(() => {
    resetBookingCount();
  }, [resetBookingCount]);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "date" });
  const pageSize = 10;

  const { items: apiItems, total: apiTotal, isLoading, error, isRefetching, refetch } = useAdminBookings({
    search: debouncedSearch,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const items = useMemo(() => {
    return [...optimisticBookings, ...apiItems];
  }, [optimisticBookings, apiItems]);

  const total = apiTotal + optimisticBookings.length;

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

  const handleBookingCreated = useCallback((result: AdminBookingResult) => {
    const newBooking = buildAdminBookingFromResult(result);
    setOptimisticBookings((prev) => [newBooking, ...prev]);
    notifyBookingParties(result);
  }, []);

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.patient") ?? "Patient",
        placeholder: "Search by patient, therapist, or ID\u2026",
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
      {
        key: "date",
        type: "daterange",
        label: t("admin_dashboard.dateTime") ?? "Date Range",
        fromKey: "dateFrom",
        toKey: "dateTo",
      },
    ],
    [t],
  );

  const columns: Column<AdminBookingData>[] = useMemo(
    () => [
      {
        key: "patient",
        label: t("admin_dashboard.patient") ?? "Patient",
        sortable: true,
        render: (row) => (
          <div>
            <span className="font-medium">{row.patient}</span>
            {row.patientPhone && (
              <span className="text-xs text-text-light block">{row.patientPhone}</span>
            )}
          </div>
        ),
      },
      {
        key: "therapist",
        label: t("admin_dashboard.therapist") ?? "Therapist",
        sortable: true,
        render: (row) => (
          <div>
            <span className="font-medium">{row.therapist}</span>
            {row.therapistPhone && (
              <span className="text-xs text-text-light block">{row.therapistPhone}</span>
            )}
          </div>
        ),
      },
      {
        key: "date",
        label: t("admin_dashboard.date") ?? "Date",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">{row.date}</span>
        ),
      },
      {
        key: "originalTime",
        label: "Time",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">{row.originalTime}</span>
        ),
      },
      {
        key: "sessionType",
        label: t("admin_dashboard.sessionType") ?? "Type",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.sessionType}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [t],
  );

  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="font-display text-xl">
            {t("admin_dashboard.allBookings") ?? "Bookings"}
            <span className="ml-2 text-sm font-normal text-text-light font-mono">({total})</span>
          </h3>
          <p className="text-sm text-text-light mt-1">
            Cancellations and reschedules update the therapist&apos;s calendar instantly and notify both sides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline !py-2 !px-3 text-xs cursor-pointer ${showFilters ? "!bg-secondary !text-white" : ""}`}
          >
            <Filter size={14} className="inline mr-1" /> Filter
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3D2B] text-white text-sm font-semibold hover:bg-[#1F3D2B]/90 transition-colors shrink-0"
          >
            <Plus size={16} />
            Book Session
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />
      )}

      <DataTable
        columns={columns}
        data={items}
        total={total}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        sortColumn={sort.column}
        sortOrder={sort.direction}
        onSortToggle={(col) => {
          toggleSort(col);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage={t("common.noResults") ?? "No bookings found"}
      />

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
