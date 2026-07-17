"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Download, Eye, Pencil, UserPlus, ArrowUpRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminComplaints } from "@/hooks/useAdminComplaints";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabKey = "patient" | "therapist";

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
        <ComplaintPreviewDialog
          complaint={previewRow}
          onClose={() => setPreviewRow(null)}
        />
      )}

      {editRow && (
        <ComplaintEditDialog
          complaint={editRow}
          onClose={() => setEditRow(null)}
        />
      )}

      {assignRow && (
        <AssignDialog
          complaint={assignRow}
          onClose={() => setAssignRow(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteRow}
        onOpenChange={(open) => !open && setDeleteRow(null)}
        onConfirm={handleDelete}
        title={t("common.delete") ?? "Delete complaint"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} <strong>${deleteRow?.id ?? ""}</strong>? ${deleteRow?.description?.slice(0, 80) ?? ""}`}
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

  const { items, total, isLoading, updateComplaint } = useAdminComplaints({
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
        options: [
          { value: "Open", label: t("admin_dashboard.open") ?? "Open" },
          { value: "Under review", label: t("admin_dashboard.underReview") ?? "Under review" },
          { value: "Resolved", label: t("admin_dashboard.resolved") ?? "Resolved" },
          { value: "Dismissed", label: t("admin_dashboard.dismissed") ?? "Dismissed" },
        ],
      },
      {
        key: "priority",
        type: "select",
        label: t("admin_dashboard.priority") ?? "Priority",
        placeholder: "All priorities",
        options: [
          { value: "Normal", label: t("admin_dashboard.normal") ?? "Normal" },
          { value: "Urgent", label: t("admin_dashboard.urgent") ?? "Urgent" },
        ],
      },
      {
        key: "category",
        type: "select",
        label: t("admin_dashboard.category") ?? "Category",
        placeholder: "All categories",
        options: [
          { value: "Late arrival", label: "Late arrival" },
          { value: "Unprofessional conduct", label: "Unprofessional conduct" },
          { value: "Billing dispute", label: "Billing dispute" },
          { value: "Repeated no-shows", label: "Repeated no-shows" },
          { value: "Safety concern at home", label: "Safety concern at home" },
        ],
      },
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

function ComplaintPreviewDialog({
  complaint,
  onClose,
}: {
  complaint: AdminComplaintData;
  onClose: () => void;
}) {
  const { t } = useLang();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{t("complaints.complaintDetail") ?? "Complaint Detail"}</DialogTitle>
          <DialogDescription>{complaint.id} · {complaint.category}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
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
      </DialogContent>
    </Dialog>
  );
}

function ComplaintEditDialog({
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{t("admin_dashboard.edit") ?? "Edit Complaint"}</DialogTitle>
          <DialogDescription>{complaint.id}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
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
                <SelectItem value="Late arrival">Late arrival</SelectItem>
                <SelectItem value="Unprofessional conduct">Unprofessional conduct</SelectItem>
                <SelectItem value="Billing dispute">Billing dispute</SelectItem>
                <SelectItem value="Repeated no-shows">Repeated no-shows</SelectItem>
                <SelectItem value="Safety concern at home">Safety concern at home</SelectItem>
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

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              {t("complaints.internalNotes") ?? "Add Note (optional)"}
            </label>
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder="e.g. Follow-up scheduled with patient"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-text-light hover:bg-muted transition cursor-pointer"
          >
            {t("common.cancel") ?? "Cancel"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : (t("common.save") ?? "Save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{t("admin_dashboard.assign") ?? "Assign Complaint"}</DialogTitle>
          <DialogDescription>{complaint.id} · {complaint.category}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3 bg-surface rounded-xl p-3 text-sm">
            <Avatar name={complaint.complainant} size={28} />
            <div>
              <span className="font-medium">{complaint.complainant}</span>
              <span className="text-text-light ml-2">→ {complaint.against}</span>
            </div>
          </div>

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
              {t("complaints.internalNotes") ?? "Add Note (optional)"}
            </label>
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder="e.g. Assigned for priority review"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px] resize-y"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-text-light hover:bg-muted transition cursor-pointer"
          >
            {t("common.cancel") ?? "Cancel"}
          </button>
          <button
            onClick={handleAssign}
            disabled={saving || !assignee}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Assign"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
