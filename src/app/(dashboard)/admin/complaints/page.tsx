"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/Avatar";
import { Download, Eye, Pencil, UserPlus, ArrowUpRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminComplaints } from "@/hooks/useAdminComplaints";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import {
  DataTable,
  ActionMenu,
  FilterBar,
  StatusChip,
  ConfirmDialog,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import type { AdminComplaintData } from "@/services/api/admin";
import { getSession } from "@/services/api/sessions";
import { formatDate, to12h, formatType, npr } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabKey = "patient" | "therapist";

const COMPLAINT_CATEGORIES = [
  "Late arrival",
  "Unprofessional conduct",
  "Billing dispute",
  "Service quality",
  "Safety concern",
  "Safety concern at home",
  "Patient no-show",
  "Repeated no-shows",
  "Late cancellation",
  "Unsafe environment",
  "Harassment or abuse",
  "Other",
] as const;

const COMPLAINT_STATUSES = ["Open", "Under review", "Resolved", "Dismissed"] as const;

const COMPLAINT_PRIORITIES = ["Normal", "Urgent"] as const;

export default function AdminComplaints() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<TabKey>("patient");
  const [previewRow, setPreviewRow] = useState<AdminComplaintData | null>(null);
  const [editRow, setEditRow] = useState<AdminComplaintData | null>(null);
  const [assignRow, setAssignRow] = useState<AdminComplaintData | null>(null);
  const [deleteRow, setDeleteRow] = useState<AdminComplaintData | null>(null);

  const { deleteComplaint } = useAdminComplaints({
    type: activeTab,
    search: "",
    status: "",
    priority: "",
    category: "",
    sortBy: "filed",
    sortOrder: "desc",
    page: 1,
    pageSize: 10,
  });

  const handleDelete = useCallback(async () => {
    if (!deleteRow) return;
    try {
      await deleteComplaint(deleteRow.id);
      toast.success(`Complaint ${deleteRow.id} deleted`);
      setDeleteRow(null);
    } catch {
      toast.error("Failed to delete complaint");
    }
  }, [deleteRow, deleteComplaint, t]);

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
          <ComplaintsTab
            type="patient"
            onPreview={setPreviewRow}
            onEdit={setEditRow}
            onAssign={setAssignRow}
            onDelete={setDeleteRow}
          />
        )}
        {activeTab === "therapist" && (
          <ComplaintsTab
            type="therapist"
            onPreview={setPreviewRow}
            onEdit={setEditRow}
            onAssign={setAssignRow}
            onDelete={setDeleteRow}
          />
        )}
      </div>

      {previewRow && (
        <ComplaintPreviewSheet
          complaint={previewRow}
          onClose={() => setPreviewRow(null)}
        />
      )}

      {editRow && (
        <ComplaintEditSheet
          complaint={editRow}
          onClose={() => setEditRow(null)}
        />
      )}

      {assignRow && (
        <AssignSheet
          complaint={assignRow}
          onClose={() => setAssignRow(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={(open) => !open && setDeleteRow(null)}
        onConfirm={handleDelete}
        title={t("complaints.deleteTitle") ?? "Delete complaint"}
        description={
          deleteRow
            ? `${deleteRow.complainant} → ${deleteRow.against}<br/><br/>${
                t("complaints.deletePermanent") ?? "This complaint will be permanently deleted. This action cannot be undone."
              }`
            : ""
        }
      />
    </div>
  );
}

function ComplaintsTab({
  type,
  onPreview,
  onEdit,
  onAssign,
  onDelete,
}: {
  type: TabKey;
  onPreview: (row: AdminComplaintData) => void;
  onEdit: (row: AdminComplaintData) => void;
  onAssign: (row: AdminComplaintData) => void;
  onDelete: (row: AdminComplaintData) => void;
}) {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "filed" });
  const pageSize = 10;

  const { items, total, isLoading, isRefetching, refetch, updateComplaint } = useAdminComplaints({
    type,
    search: debouncedSearch,
    status,
    priority,
    category,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategory("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, status, priority, category }),
    [search, status, priority, category],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "status") setStatus(value);
      else if (key === "priority") setPriority(value);
      else if (key === "category") setCategory(value);
      setPage(1);
    },
    [],
  );

  const exportCsv = useCallback(() => {
    const nameKey = type === "patient" ? "Complainant (Patient)" : "Complainant (Therapist)";
    const againstKey = type === "patient" ? "Against Therapist" : "Against Patient";
    const header = `${nameKey},${againstKey},Category,Priority,Status,Filed\n`;
    const body = items
      .map((r) => `${r.complainant},${r.against},${r.category},${r.priority},${r.status},${r.filed}`)
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

  const handleEscalate = useCallback(
    async (row: AdminComplaintData) => {
      try {
        await updateComplaint(row.id, { priority: "Urgent", status: "Under review" });
        toast.success(t("complaints.escalated") ?? `Complaint ${row.id} escalated`);
      } catch {
        toast.error("Failed to escalate complaint");
      }
    },
    [updateComplaint, t],
  );

  const renderActions = useCallback(
    (row: AdminComplaintData) => {
      const actions: ActionItem[] = [
        {
          key: "preview",
          label: t("complaints.viewComplaint") ?? "View",
          icon: <Eye size={14} />,
          onClick: () => onPreview(row),
        },
        {
          key: "edit",
          label: t("admin_dashboard.edit") ?? "Edit",
          icon: <Pencil size={14} />,
          onClick: () => onEdit(row),
        },
        {
          key: "assign",
          label: t("admin_dashboard.assign") ?? "Assign",
          icon: <UserPlus size={14} />,
          tooltip: row.assignee ? `Assigned to: ${row.assignee}` : undefined,
          onClick: () => onAssign(row),
        },
        {
          key: "escalate",
          label: t("admin_dashboard.escalate") ?? "Escalate",
          icon: <ArrowUpRight size={14} />,
          onClick: () => handleEscalate(row),
        },
        {
          key: "delete",
          label: t("admin_dashboard.delete") ?? "Delete",
          icon: <Trash2 size={14} />,
          variant: "destructive",
          onClick: () => onDelete(row),
        },
      ];
      return <ActionMenu actions={actions} />;
    },
    [onPreview, onEdit, onAssign, t, handleEscalate, onDelete],
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
        options: COMPLAINT_STATUSES.map((s) => ({
          value: s,
          label:
            s === "Open"
              ? (t("admin_dashboard.open") ?? "Open")
              : s === "Under review"
                ? (t("admin_dashboard.underReview") ?? "Under review")
                : s === "Resolved"
                  ? (t("admin_dashboard.resolved") ?? "Resolved")
                  : (t("admin_dashboard.dismissed") ?? "Dismissed"),
        })),
      },
      {
        key: "priority",
        type: "select",
        label: t("admin_dashboard.priority") ?? "Priority",
        placeholder: "All priorities",
        options: COMPLAINT_PRIORITIES.map((p) => ({
          value: p,
          label: p === "Normal" ? (t("admin_dashboard.normal") ?? "Normal") : (t("admin_dashboard.urgent") ?? "Urgent"),
        })),
      },
      {
        key: "category",
        type: "select",
        label: t("admin_dashboard.category") ?? "Category",
        placeholder: "All categories",
        options: COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
    ],
    [type, t],
  );

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-3">
        <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
        <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
          <Download size={14} className="inline mr-1" /> {t("admin_dashboard.exportCsv") ?? "Export CSV"}
        </button>
      </div>

      <FilterBar
        filters={filterConfig}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={resetFilters}
        expandable
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

function ComplaintPreviewSheet({
  complaint,
  onClose,
}: {
  complaint: AdminComplaintData;
  onClose: () => void;
}) {
  const { t } = useLang();
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["session", complaint.bookingId],
    queryFn: () => (complaint.bookingId ? getSession(complaint.bookingId) : null),
    enabled: !!complaint.bookingId,
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-display">{t("complaints.complaintDetail") ?? "Complaint Detail"}</SheetTitle>
              <SheetDescription className="text-xs">
                {complaint.category} · {formatDate(complaint.filed)}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <StatusChip status={complaint.status} />
            <StatusChip status={complaint.priority} />
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-5">
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
              {bookingLoading ? (
                <span className="text-xs text-text-light">{t("complaints.loadingBooking") ?? "Loading booking…"}</span>
              ) : booking ? (
                <div className="bg-surface rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] uppercase font-mono text-text-light">
                      {t("complaints.bookingWhen") ?? "Date & Time"}
                    </span>
                    <span className="font-mono text-xs font-medium">
                      {formatDate(booking.date)} · {to12h(booking.time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] uppercase font-mono text-text-light">
                      {t("complaints.bookingType") ?? "Booking type"}
                    </span>
                    <span className="font-mono text-xs font-medium">{formatType(booking.type)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] uppercase font-mono text-text-light">
                      {t("complaints.bookingFee") ?? "Fee"}
                    </span>
                    <span className="font-mono text-xs font-medium">{npr(booking.fee)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] uppercase font-mono text-text-light">
                      {t("complaints.bookingStatus") ?? "Status"}
                    </span>
                    <span className="font-mono text-xs font-medium">{formatType(booking.status)}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-text-light">{t("complaints.bookingNotFound") ?? "Booking details not available"}</span>
              )}
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

          {complaint.assignee && (
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                {t("admin_dashboard.assign") ?? "Assigned To"}
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={complaint.assignee} size={24} />
                <span className="font-medium">{complaint.assignee}</span>
              </div>
            </div>
          )}

          {complaint.notes && complaint.notes.length > 0 && (
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">
                {t("complaints.internalNotes") ?? "Internal Notes"}
              </span>
              <div className="space-y-2">
                {complaint.notes.map((note, i) => (
                  <div key={i} className="text-sm bg-surface rounded-xl p-3">{note}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ComplaintEditSheet({
  complaint,
  onClose,
}: {
  complaint: AdminComplaintData;
  onClose: () => void;
}) {
  const { t } = useLang();
  const { updateComplaint } = useAdminComplaints({
    type: complaint.type,
    search: "",
    status: "",
    priority: "",
    category: "",
    sortBy: "filed",
    sortOrder: "desc",
    page: 1,
    pageSize: 10,
  });

  const [statusVal, setStatusVal] = useState(complaint.status);
  const [priorityVal, setPriorityVal] = useState(complaint.priority);
  const [categoryVal, setCategoryVal] = useState(complaint.category);
  const [descriptionVal, setDescriptionVal] = useState(complaint.description);
  const [noteVal, setNoteVal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedNotes = noteVal.trim()
        ? [...(complaint.notes ?? []), noteVal.trim()]
        : complaint.notes;
      await updateComplaint(complaint.id, {
        status: statusVal,
        priority: priorityVal,
        category: categoryVal,
        description: descriptionVal,
        notes: updatedNotes,
      });
      toast.success("Complaint updated");
      onClose();
    } catch {
      toast.error("Failed to update complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg font-display">{t("admin_dashboard.edit") ?? "Edit Complaint"}</SheetTitle>
          <SheetDescription className="text-xs">
            {complaint.category} · {formatDate(complaint.filed)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("admin_dashboard.status") ?? "Status"}
            </label>
            <Select value={statusVal} onValueChange={(v) => setStatusVal(v as AdminComplaintData["status"])}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">{t("admin_dashboard.open") ?? "Open"}</SelectItem>
                <SelectItem value="Under review">{t("admin_dashboard.underReview") ?? "Under review"}</SelectItem>
                <SelectItem value="Resolved">{t("admin_dashboard.resolved") ?? "Resolved"}</SelectItem>
                <SelectItem value="Dismissed">{t("admin_dashboard.dismissed") ?? "Dismissed"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("admin_dashboard.priority") ?? "Priority"}
            </label>
            <Select value={priorityVal} onValueChange={(v) => setPriorityVal(v as AdminComplaintData["priority"])}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">{t("admin_dashboard.normal") ?? "Normal"}</SelectItem>
                <SelectItem value="Urgent">{t("admin_dashboard.urgent") ?? "Urgent"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("admin_dashboard.category") ?? "Category"}
            </label>
            <Select value={categoryVal} onValueChange={setCategoryVal}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("complaints.complaintText") ?? "Description"}
            </label>
            <textarea
              value={descriptionVal}
              onChange={(e) => setDescriptionVal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[100px] resize-y"
            />
          </div>

          {complaint.assignee && (
            <div>
              <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
                {t("admin_dashboard.assign") ?? "Assigned To"}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted text-sm">
                <Avatar name={complaint.assignee} size={20} />
                <span className="font-medium">{complaint.assignee}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("complaints.internalNotes") ?? "Internal Notes"}
            </label>
            {complaint.notes && complaint.notes.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {complaint.notes.map((note, i) => (
                  <p key={i} className="text-xs text-text-light bg-surface rounded-lg px-3 py-2">{note}</p>
                ))}
              </div>
            )}
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder={t("complaints.addNote") ?? "Add a note…"}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 pb-2">
          <button
            onClick={onClose}
            className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {t("common.cancel") ?? "Cancel"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : (t("common.save") ?? "Save")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AssignSheet({
  complaint,
  onClose,
}: {
  complaint: AdminComplaintData;
  onClose: () => void;
}) {
  const { t } = useLang();
  const { updateComplaint } = useAdminComplaints({
    type: complaint.type,
    search: "",
    status: "",
    priority: "",
    category: "",
    sortBy: "filed",
    sortOrder: "desc",
    page: 1,
    pageSize: 10,
  });

  const [assignee, setAssignee] = useState(complaint.assignee ?? "");
  const [noteVal, setNoteVal] = useState("");
  const [saving, setSaving] = useState(false);

  const assigneeOptions = useMemo(() => {
    if (complaint.type === "patient") {
      return [
        { value: "Dr. Anita Sharma", label: "Dr. Anita Sharma" },
        { value: "Rajesh Shrestha", label: "Rajesh Shrestha" },
        { value: "Suman Gurung", label: "Suman Gurung" },
      ];
    }
    return [
      { value: "Nabin Khadka", label: "Nabin Khadka" },
      { value: "Priya Magar", label: "Priya Magar" },
      { value: "Ravi Thapa", label: "Ravi Thapa" },
    ];
  }, [complaint.type]);

  const handleAssign = async () => {
    if (!assignee) {
      toast.error("Please select an assignee");
      return;
    }
    setSaving(true);
    try {
      const updatedNotes = noteVal.trim()
        ? [...(complaint.notes ?? []), noteVal.trim()]
        : complaint.notes;
      await updateComplaint(complaint.id, {
        assignee,
        status: "Under review",
        notes: updatedNotes,
      });
      toast.success(`Complaint ${complaint.id} assigned to ${assignee}`);
      onClose();
    } catch {
      toast.error("Failed to assign complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg font-display">{t("admin_dashboard.assign") ?? "Assign Complaint"}</SheetTitle>
          <SheetDescription className="text-xs">
            {complaint.category} · {formatDate(complaint.filed)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3 bg-surface rounded-xl p-3 text-sm">
            <Avatar name={complaint.complainant} size={28} />
            <div>
              <span className="font-medium">{complaint.complainant}</span>
              <span className="text-text-light ml-2">→ {complaint.against}</span>
            </div>
          </div>

          {complaint.assignee && (
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2 text-sm">
              <UserPlus size={14} className="text-secondary" />
              <span className="text-text-light">Currently assigned:</span>
              <span className="font-medium">{complaint.assignee}</span>
            </div>
          )}

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {"Assign to"}
            </label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="h-9 rounded-full border-border text-sm">
                <SelectValue placeholder="Select a person…" />
              </SelectTrigger>
              <SelectContent>
                {assigneeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("complaints.internalNotes") ?? "Internal Notes"}
            </label>
            {complaint.notes && complaint.notes.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {complaint.notes.map((note, i) => (
                  <p key={i} className="text-xs text-text-light bg-surface rounded-lg px-3 py-2">{note}</p>
                ))}
              </div>
            )}
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder={t("complaints.addNote") ?? "Add a note…"}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 pb-2">
          <button
            onClick={onClose}
            className="flex-1 btn-outline !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {t("common.cancel") ?? "Cancel"}
          </button>
          <button
            onClick={handleAssign}
            disabled={saving || !assignee}
            className="flex-1 btn-secondary !py-2 text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Assign"}
          </button>
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
