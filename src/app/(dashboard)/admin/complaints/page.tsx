"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Download, Eye, UserPlus, ArrowUpRight, X } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminComplaints } from "@/hooks/useAdminComplaints";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminComplaintData } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type TabKey = "patient" | "therapist";

export default function AdminComplaints() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("patient");
  const [detailRow, setDetailRow] = useState<AdminComplaintData | null>(null);

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="font-display text-xl">{t("complaints.title") ?? "Complaints"}</h3>
            <p className="text-sm text-text-light mt-1">{t("complaints.subtitle") ?? "Patient and therapist complaints are kept in separate, independent queues."}</p>
          </div>
        </div>

        <div className="tabs-filter mb-5">
          {(["patient", "therapist"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === tab ? "tab-active" : "text-text-light hover:text-text"
              }`}
            >
              {tab === "patient"
                ? (t("complaints.patientTab") ?? "Filed by Patients (against therapists)")
                : (t("complaints.therapistTab") ?? "Filed by Therapists (against patients)")
              }
            </button>
          ))}
        </div>

        {activeTab === "patient" && (
          <ComplaintsTab type="patient" onView={setDetailRow} />
        )}
        {activeTab === "therapist" && (
          <ComplaintsTab type="therapist" onView={setDetailRow} />
        )}
      </div>

      {detailRow && (
        <ComplaintDetailDrawer
          complaint={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </div>
  );
}

function ComplaintsTab({
  type,
  onView,
}: {
  type: TabKey;
  onView: (row: AdminComplaintData) => void;
}) {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "filed" });
  const pageSize = 10;

  const { items, total, isLoading } = useAdminComplaints({
    type,
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

  const exportCsv = useCallback(() => {
    const nameKey = type === "patient" ? "Complainant (Patient)" : "Complainant (Therapist)";
    const againstKey = type === "patient" ? "Against Therapist" : "Against Patient";
    const header = `ID,${nameKey},${againstKey},Category,Priority,Status,Filed\n`;
    const body = items
      .map((r) => `${r.id},${r.complainant},${r.against},${r.category},${r.priority},${r.status},${r.filed}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin_dashboard.exportedCsv") ?? "Exported CSV");
  }, [items, type, t]);

  const columns: Column<AdminComplaintData>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        render: (row) => <span className="font-mono text-xs">{row.id}</span>,
      },
      {
        key: "complainant",
        label: type === "patient" ? (t("admin_dashboard.patient") ?? "Patient") : (t("admin_dashboard.therapist") ?? "Therapist"),
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.complainant} size={28} />
            <span className="font-medium">{row.complainant}</span>
          </div>
        ),
      },
      {
        key: "against",
        label: type === "patient" ? (t("admin_dashboard.againstTherapist") ?? "Against Therapist") : (t("admin_dashboard.againstPatient") ?? "Against Patient"),
        render: (row) => <span className="text-text-light">{row.against}</span>,
      },
      {
        key: "category",
        label: t("admin_dashboard.category") ?? "Category",
        render: (row) => <span className="text-text-light">{row.category}</span>,
      },
      {
        key: "priority",
        label: t("admin_dashboard.priority") ?? "Priority",
        render: (row) => <StatusChip status={row.priority} />,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        render: (row) => <StatusChip status={row.status} />,
      },
      {
        key: "filed",
        label: t("admin_dashboard.filed") ?? "Filed",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {formatRelativeTime(row.filed)}
          </span>
        ),
      },
    ],
    [type, t],
  );

  const renderActions = useCallback(
    (row: AdminComplaintData) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => onView(row)}
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
          title={t("complaints.viewComplaint") ?? "View"}
        >
          <Eye size={15} />
        </button>
        <button
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
          title={t("admin_dashboard.assign") ?? "Assign"}
        >
          <UserPlus size={15} />
        </button>
        <button
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-danger transition cursor-pointer"
          title={t("admin_dashboard.escalate") ?? "Escalate"}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>
    ),
    [onView, t],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: type === "patient" ? (t("admin_dashboard.patient") ?? "Patient") : (t("admin_dashboard.therapist") ?? "Therapist"),
        placeholder: type === "patient" ? "Search patient…" : "Search therapist…",
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: t("admin_dashboard.allStatuses") ?? "All statuses",
        options: [
          { value: "Open", label: t("admin_dashboard.open") ?? "Open" },
          { value: "Under review", label: t("admin_dashboard.underReview") ?? "Under review" },
          { value: "Resolved", label: t("admin_dashboard.resolved") ?? "Resolved" },
          { value: "Dismissed", label: t("admin_dashboard.dismissed") ?? "Dismissed" },
        ],
      },
      { key: "dateFrom", type: "date", label: t("admin_dashboard.filed") ?? "From date" },
      { key: "dateTo", type: "date", label: "To date" },
    ],
    [type, t],
  );

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
          <Download size={14} className="inline mr-1" /> {t("admin_dashboard.exportCsv") ?? "Export CSV"}
        </button>
      </div>

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
        onSortToggle={(col) => {
          toggleSort(col);
          setPage(1);
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        renderActions={renderActions}
        emptyMessage={t("common.noResults") ?? "No results found"}
      />
    </div>
  );
}

function ComplaintDetailDrawer({
  complaint,
  onClose,
}: {
  complaint: AdminComplaintData;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [noteText, setNoteText] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const handleResolve = () => {
    if (!resolutionNote.trim()) {
      toast.error("Resolution note is required");
      return;
    }
    toast.success(t("complaints.resolved") ?? "Complaint resolved");
    onClose();
  };

  const handleDismiss = () => {
    if (!resolutionNote.trim()) {
      toast.error("Resolution note is required");
      return;
    }
    toast.success(t("complaints.dismissed") ?? "Complaint dismissed");
    onClose();
  };

  const handleEscalate = () => {
    toast.success(t("complaints.escalated") ?? "Complaint escalated");
    onClose();
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{t("complaints.complaintDetail") ?? "Complaint Detail"}</SheetTitle>
          <SheetDescription>{complaint.id} · {complaint.category}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusChip status={complaint.status} />
            <StatusChip status={complaint.priority} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                {complaint.type === "patient" ? (t("admin_dashboard.patient") ?? "Patient") : (t("admin_dashboard.therapist") ?? "Therapist")}
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={complaint.complainant} size={24} />
                <span className="font-medium">{complaint.complainant}</span>
              </div>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                {complaint.type === "patient" ? (t("admin_dashboard.againstTherapist") ?? "Against Therapist") : (t("admin_dashboard.againstPatient") ?? "Against Patient")}
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={complaint.against} size={24} />
                <span className="font-medium">{complaint.against}</span>
              </div>
            </div>
          </div>

          {complaint.bookingId && (
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                {t("complaints.linkedBooking") ?? "Linked Booking"}
              </span>
              <span className="font-mono text-xs bg-surface px-2 py-1 rounded">{complaint.bookingId}</span>
            </div>
          )}

          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
              {t("complaints.complaintText") ?? "Complaint Text"}
            </span>
            <p className="text-sm leading-relaxed bg-surface rounded-xl p-3">{complaint.description}</p>
          </div>

          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
              {t("admin_dashboard.filed") ?? "Filed"}
            </span>
            <span className="font-mono text-xs text-text-light">{formatRelativeTime(complaint.filed)}</span>
          </div>

          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">
              {t("complaints.internalNotes") ?? "Internal Notes"}
            </span>
            {complaint.notes && complaint.notes.length > 0 ? (
              <div className="space-y-2">
                {complaint.notes.map((note, i) => (
                  <div key={i} className="text-sm bg-surface rounded-xl p-3">{note}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">{t("complaints.noNotes") ?? "No internal notes yet."}</p>
            )}
            <div className="mt-2 flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t("complaints.addNote") ?? "Add a note…"}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm"
              />
              <button
                onClick={() => {
                  if (noteText.trim()) {
                    toast.success("Note added");
                    setNoteText("");
                  }
                }}
                className="chip !bg-secondary !text-white cursor-pointer"
              >
                {t("common.add") ?? "Add"}
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">
              {t("complaints.resolutionActions") ?? "Resolution Actions"}
            </span>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={t("complaints.resolutionNotePlaceholder") ?? "Enter resolution notes…"}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm mb-3 min-h-[80px]"
            />
            <div className="flex flex-wrap gap-2">
              <button onClick={handleResolve} className="chip !bg-success !text-white cursor-pointer">
                {t("admin_dashboard.resolved") ?? "Resolve"}
              </button>
              <button onClick={handleDismiss} className="chip !bg-muted !text-text-light cursor-pointer">
                {t("admin_dashboard.dismissed") ?? "Dismiss"}
              </button>
              <button onClick={handleEscalate} className="chip !bg-danger !text-white cursor-pointer">
                {t("admin_dashboard.urgent") ?? "Escalate"}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
