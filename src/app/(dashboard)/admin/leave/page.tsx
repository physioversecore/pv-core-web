"use client";

import { useState, useMemo, useCallback } from "react";
import { Check, X, Eye, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminLeaves } from "@/hooks/useAdminLeaves";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  StatusChip,
  type Column,
} from "@/components/tables";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminLeaveData } from "@/services/api/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


export default function LeavePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<AdminLeaveData | null>(null);
  const [dateFrom, setDateFrom] = useState("");

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "therapist" });
  const pageSize = 10;

  const { items, total, isLoading, approveLeaveRequest, declineLeaveRequest } = useAdminLeaves({
    search: debouncedSearch,
    status,
    dateFrom,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setDateFrom("");
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "status") setStatus(value);
      else if (key === "dateFrom") setDateFrom(value);
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
        <div className="flex items-end gap-3 mb-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[0.65rem] uppercase font-mono text-text-light">
              Therapist
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                value={search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search therapist…"
                className="pl-9 pr-3 py-2 h-9 rounded-full border border-border bg-background text-sm w-56"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[0.65rem] uppercase font-mono text-text-light">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => handleFilterChange("status", v)}
            >
              <SelectTrigger className="h-9 w-40 rounded-full border-border text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[0.65rem] uppercase font-mono text-text-light">
              Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="h-9 w-40 rounded-full border border-border bg-background px-3 text-sm"
            />
          </div>

          {(status || dateFrom) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 h-9 self-end px-3 rounded-full text-xs font-medium text-text-light hover:text-text hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Leave Request</DialogTitle>
          <DialogDescription>{leave.therapist} · {leave.reason}</DialogDescription>
        </DialogHeader>
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
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border text-sm font-medium text-text-light hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
