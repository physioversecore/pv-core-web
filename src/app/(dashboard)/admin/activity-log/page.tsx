"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminActivityLog } from "@/hooks/useAdminActivityLog";
import { DataTable, FilterBar, type Column, type FilterConfig } from "@/components/tables";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { toast } from "sonner";
import { getAdminStaffList } from "@/services/api/admin";
import type { AdminActivityLogEntry } from "@/services/api/admin";

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffDay === 0) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  if (diffDay === 1) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const [adminId, setAdminId] = useState("");
  const [actionType, setActionType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "timestamp", defaultDirection: "desc" });
  const pageSize = 15;

  const { data: adminList } = useQuery({
    queryKey: ["admin-staff-for-log"],
    queryFn: getAdminStaffList,
    placeholderData: (prev) => prev,
  });

  const adminOptions = useMemo(
    () =>
      (adminList?.items ?? [])
        .filter((a) => a.id && a.name)
        .map((a) => ({ value: a.id, label: a.name })),
    [adminList],
  );

  const { items, total, isLoading, isRefetching, refetch } = useAdminActivityLog({
    search: debouncedSearch,
    adminId,
    actionType,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setAdminId("");
    setActionType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, adminId, actionType, dateFrom, dateTo }),
    [search, adminId, actionType, dateFrom, dateTo],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "adminId") setAdminId(value);
      else if (key === "actionType") setActionType(value);
      else if (key === "dateFrom") setDateFrom(value);
      else if (key === "dateTo") setDateTo(value);
      setPage(1);
    },
    [],
  );

  const exportCsv = useCallback(() => {
    const header = "Timestamp,Actor,Action,Description\n";
    const body = items
      .map((r) => `${r.timestamp},${r.actor},"${r.actionType}","${r.description.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported audit log");
  }, [items]);

  const columns: Column<AdminActivityLogEntry>[] = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Time",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-[0.65rem] text-text-light uppercase">
            {formatTimestamp(row.timestamp)}
          </span>
        ),
      },
      {
        key: "actor",
        label: "Actor",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">{row.actor}</span>
              <span className="text-xs text-text-light">{row.actionType}</span>
            </div>
          </div>
        ),
      },
      {
        key: "actionType",
        label: "Action",
        render: (row) => (
          <span className="chip !bg-muted !text-muted-foreground">{row.actionType}</span>
        ),
      },
      {
        key: "description",
        label: "Description",
        render: (row) => (
          <p className="text-sm text-text leading-relaxed">
            {highlightDescription(row.description)}
          </p>
        ),
      },
    ],
    [],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Search", placeholder: "Search action or entity…" },
      {
        key: "adminId",
        type: "select",
        label: "Admin",
        placeholder: "All admins",
        options: adminOptions,
      },
      {
        key: "actionType",
        type: "select",
        label: "Action type",
        placeholder: "All actions",
        options: [
          { value: "APPROVE_THERAPIST", label: "Therapist verified" },
          { value: "REJECT_THERAPIST", label: "Therapist rejected" },
          { value: "CREATE_THERAPIST", label: "Therapist created" },
          { value: "UPDATE_THERAPIST", label: "Therapist updated" },
          { value: "DELETE_THERAPIST", label: "Therapist removed" },
          { value: "TOGGLE_USER_STATUS", label: "User status updated" },
          { value: "UPDATE_PATIENT", label: "Patient updated" },
          { value: "DELETE_PATIENT", label: "Patient removed" },
          { value: "APPROVE_VERIFICATION", label: "Verification approved" },
          { value: "REJECT_VERIFICATION", label: "Verification rejected" },
          { value: "SUSPEND_VERIFICATION", label: "Verification suspended" },
          { value: "UPDATE_COMPLAINT", label: "Complaint updated" },
          { value: "ASSIGN_COMPLAINT", label: "Complaint assigned" },
          { value: "DELETE_COMPLAINT", label: "Complaint removed" },
          { value: "CREATE_REFUND", label: "Refund created" },
          { value: "UPDATE_REFUND", label: "Refund updated" },
          { value: "ASSIGN_REFUND", label: "Refund assigned" },
          { value: "DELETE_REFUND", label: "Refund removed" },
          { value: "APPROVE_LEAVE", label: "Leave approved" },
          { value: "REJECT_LEAVE", label: "Leave rejected" },
          { value: "UPDATE_PAYMENT", label: "Payment updated" },
          { value: "UPDATE_TEAM", label: "Team member updated" },
          { value: "INVITE_TEAM", label: "Team member invited" },
          { value: "UPDATE_SETTING", label: "Setting updated" },
          { value: "SCHEDULE_REVIEW", label: "Performance review scheduled" },
          { value: "RESOLVE_REVIEW", label: "Performance review resolved" },
          { value: "UPDATE_PAYOUT", label: "Payout updated" },
        ],
      },
      { key: "dateFrom", type: "date", label: "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [adminOptions],
  );

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl">Activity Log</h3>
            <p className="text-sm text-text-light mt-1">
              A complete, admin-level audit trail — every action taken across the platform.
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
            <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
              <Download size={14} className="inline mr-1" /> Export audit log
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
          sortColumn={sort.column}
          sortOrder={sort.direction}
          onSortToggle={(col) => {
            toggleSort(col);
            setPage(1);
          }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          emptyMessage="No log entries found"
        />
      </div>

      <p className="text-xs text-text-muted mt-4 text-center italic">
        Audit entries are immutable — they can be filtered and exported, but never edited or deleted.
      </p>
    </div>
  );
}

function highlightDescription(desc: string) {
  const parts = desc.split(/(—|CMP-\d+|BKG-\d+|Rs [\d,]+L?|[\d.]+ avg)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("CMP-") || part.startsWith("BKG-") || part.startsWith("Rs ")) {
          return <span key={i} className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">{part}</span>;
        }
        if (part === "—") {
          return <span key={i} className="text-text-muted mx-0.5">—</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
