"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, X, Eye, Calendar } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminLeaves } from "@/hooks/useAdminLeaves";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminLeaveData } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function LeavePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<AdminLeaveData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "therapist" });
  const pageSize = 10;

  const { items, total, isLoading, approveLeaveRequest, declineLeaveRequest } = useAdminLeaves({
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

  const columns: Column<AdminLeaveData>[] = useMemo(
    () => [
      {
        key: "therapist",
        label: "Therapist",
        sortable: true,
        render: (row) => <span className="font-medium">{row.therapist}</span>,
      },
      {
        key: "dateFrom",
        label: "Dates",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {row.dateFrom === row.dateTo
              ? formatDate(row.dateFrom)
              : `${formatDate(row.dateFrom)} – ${formatDate(row.dateTo)}`}
          </span>
        ),
      },
      {
        key: "reason",
        label: "Reason",
        render: (row) => <span className="text-text-light">{row.reason}</span>,
      },
      {
        key: "bookingsAffected",
        label: "Bookings affected",
        sortable: true,
        render: (row) => (
          <button
            onClick={() => setDetailRow(row)}
            className="font-mono text-sm text-secondary hover:underline cursor-pointer"
          >
            {row.bookingsAffected}
          </button>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [],
  );

  const renderActions = useCallback(
    (row: AdminLeaveData) => (
      <div className="flex items-center justify-end gap-1">
        {row.status === "Pending" ? (
          <>
            <button
              onClick={() => approveLeaveRequest(row.id)}
              className="p-1.5 rounded-lg hover:bg-success/10 text-success transition cursor-pointer"
              title="Approve"
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => declineLeaveRequest(row.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition cursor-pointer"
              title="Decline"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setDetailRow(row)}
            className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
            title="View"
          >
            <Eye size={15} />
          </button>
        )}
      </div>
    ),
    [approveLeaveRequest, declineLeaveRequest],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Therapist", placeholder: "Search therapist…" },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
          { value: "Pending", label: "Pending" },
          { value: "Approved", label: "Approved" },
          { value: "Declined", label: "Declined" },
        ],
      },
      { key: "dateFrom", type: "date", label: "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [],
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl">Leave &amp; Availability</h2>
        <p className="text-sm text-text-light mt-1">
          Approve time off so the booking calendar never shows a slot that isn&apos;t really free.
        </p>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Pending requests" value="3" sub="Needs a decision" variant="amber" />
        <DashboardStat label="On leave today" value="2" sub="Anita Tamang, Bikash Thapa" />
        <DashboardStat label="Approved this month" value="9" sub="Across 7 therapists" />
        <DashboardStat label="Bookings affected" value="5" sub="Need reassignment" variant="amber" />
      </div>

      <div className="card-soft p-5">
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />
        <DataTable
          columns={columns}
          data={items}
          total={total}
          isLoading={isLoading}
          sortColumn={sort.column}
          sortOrder={sort.direction}
          onSortToggle={(col) => { toggleSort(col); setPage(1); }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          renderActions={renderActions}
          emptyMessage="No leave requests found"
        />
      </div>

      {detailRow && <LeaveDetailDrawer leave={detailRow} onClose={() => setDetailRow(null)} />}
    </div>
  );
}

function LeaveDetailDrawer({ leave, onClose }: { leave: AdminLeaveData; onClose: () => void }) {
  const sampleBookings = [
    { patient: "Hari Bahadur Rai", date: "Jul 15, 10:00 AM" },
    { patient: "Nabin Khadka", date: "Jul 15, 2:00 PM" },
    { patient: "Sita Gurung", date: "Jul 16, 11:00 AM" },
  ];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Leave Request</SheetTitle>
          <SheetDescription>{leave.therapist} · {leave.reason}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusChip status={leave.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">Dates</span>
              <span className="font-mono text-xs">
                {leave.dateFrom === leave.dateTo
                  ? formatDate(leave.dateFrom)
                  : `${formatDate(leave.dateFrom)} – ${formatDate(leave.dateTo)}`}
              </span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">Reason</span>
              <span>{leave.reason}</span>
            </div>
          </div>
          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">
              Bookings affected ({leave.bookingsAffected})
            </span>
            <div className="space-y-2">
              {sampleBookings.slice(0, leave.bookingsAffected).map((b, i) => (
                <div key={i} className="text-sm bg-surface rounded-xl p-3 flex items-center justify-between">
                  <span>{b.patient}</span>
                  <span className="font-mono text-xs text-text-light">{b.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
