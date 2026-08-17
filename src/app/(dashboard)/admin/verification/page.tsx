"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Check,
  X,
  Send,
  Ban,
  Eye,
  Phone,
  AlertTriangle,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Plus,
  UserPlus,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminVerifications } from "@/hooks/useAdminVerifications";
import { useAdminTherapists } from "@/hooks/useAdminTherapists";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
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
import type { AdminVerificationData } from "@/services/api/admin";
import type { CreateVerificationPayload } from "@/services/api/admin";
import type { AdminCreateTherapistPayload } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VerificationPage() {
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reviewRow, setReviewRow] = useState<AdminVerificationData | null>(null);

  const [previewRow, setPreviewRow] = useState<AdminVerificationData | null>(null);
  const [callLoading, setCallLoading] = useState<string | null>(null);
  const [escalateRow, setEscalateRow] = useState<AdminVerificationData | null>(null);
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<AdminVerificationData>>
  >({});

  const [editRow, setEditRow] = useState<AdminVerificationData | null>(null);
  const [editForm, setEditForm] = useState({
    documentType: "",
    status: "",
    severity: "",
    expires: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVerificationData | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateVerificationPayload>({
    therapistId: "",
    documentType: "Practice license",
    expires: null,
    severity: undefined,
    reportedBy: "",
    phone: "",
  });
  const [createSaving, setCreateSaving] = useState(false);

  const [addTherapistOpen, setAddTherapistOpen] = useState(false);
  const [addTherapistForm, setAddTherapistForm] = useState<AdminCreateTherapistPayload>({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    specialty: "",
    gender: "Male",
    price: 0,
    experience: 0,
    bio: "",
    citizenshipNumber: "",
    panNumber: "",
    medicalLicenseUrl: "",
    certificateUrl: "",
  });
  const [addTherapistSaving, setAddTherapistSaving] = useState(false);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("");
  const [reportedByFilter, setReportedByFilter] = useState("");

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({
    defaultColumn: "therapist",
  });
  const pageSize = 10;

  const { items, total, isLoading, isRefetching, refetch, approveVerif, rejectVerif, editVerif, deleteVerif, createVerif } =
    useAdminVerifications({
      search: debouncedSearch,
      documentType,
      status,
      severity: severityFilter,
      reportedBy: reportedByFilter,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

  const { createTherapist } = useAdminTherapists({
    search: "",
    specialty: "",
    status: "",
    city: "",
    sortBy: "",
    sortOrder: "desc",
    page: 1,
    pageSize: 1,
  });

  const itemsWithOverrides = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        ...localOverrides[item.id],
      })),
    [items, localOverrides],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setDocumentType("");
    setStatus("");
    setSeverityFilter("");
    setReportedByFilter("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, documentType, status }),
    [search, documentType, status],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "documentType") setDocumentType(value);
      else if (key === "status") setStatus(value);
      setPage(1);
    },
    [],
  );

  const hasAdvancedFilters = severityFilter !== "" || reportedByFilter !== "";

  const clearAdvancedFilters = useCallback(() => {
    setSeverityFilter("");
    setReportedByFilter("");
    setPage(1);
  }, []);

  const handleCall = useCallback((row: AdminVerificationData) => {
    setCallLoading(row.id);
    setTimeout(() => {
      setCallLoading(null);
      if (row.phone) {
        window.location.href = `tel:${row.phone}`;
      } else {
        toast(
          `Calling ${row.therapist}... (mock action — API not yet connected)`,
        );
      }
    }, 1000);
  }, []);

  const handleEscalate = useCallback(() => {
    if (!escalateRow) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [escalateRow.id]: {
        ...prev[escalateRow.id],
        status: "Escalated",
      },
    }));
    toast.success(`${escalateRow.therapist} has been escalated`);
    setEscalateRow(null);
  }, [escalateRow]);

  const handleReject = useCallback(
    async (note: string) => {
      if (!reviewRow) return;
      try {
        await rejectVerif(reviewRow.id, note);
        setLocalOverrides((prev) => ({
          ...prev,
          [reviewRow.id]: {
            ...prev[reviewRow.id],
            status: "Rejected",
            note,
          },
        }));
        toast.success(
          `${reviewRow.therapist} rejected and the therapist has been notified`,
        );
        setReviewRow(null);
      } catch {
        toast.error("Failed to reject verification");
      }
    },
    [reviewRow, rejectVerif],
  );

  const handleEditSave = useCallback(async () => {
    if (!editRow) return;
    setEditSaving(true);
    try {
      const payload: Partial<AdminVerificationData> = {};
      if (editForm.documentType) payload.documentType = editForm.documentType as AdminVerificationData["documentType"];
      if (editForm.status) payload.status = editForm.status as AdminVerificationData["status"];
      if (editForm.severity) payload.severity = editForm.severity as AdminVerificationData["severity"];
      if (editForm.expires !== undefined) payload.expires = editForm.expires || null;
      await editVerif(editRow.id, payload);
      setLocalOverrides((prev) => ({
        ...prev,
        [editRow.id]: { ...prev[editRow.id], ...payload },
      }));
      toast.success(`Verification for ${editRow.therapist} updated`);
      setEditRow(null);
    } catch {
      toast.error("Failed to update verification");
    } finally {
      setEditSaving(false);
    }
  }, [editRow, editForm, editVerif]);

  const handleDeleteSubmit = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteSaving(true);
    try {
      await deleteVerif(deleteTarget.id);
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
      toast.success(`Verification for ${deleteTarget.therapist} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete verification");
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteTarget, deleteVerif]);

  const handleCreateSubmit = useCallback(async () => {
    if (!createForm.therapistId) {
      toast.error("Therapist ID is required");
      return;
    }
    setCreateSaving(true);
    try {
      await createVerif({
        therapistId: createForm.therapistId,
        documentType: createForm.documentType,
        expires: createForm.expires || null,
        severity: createForm.severity || undefined,
        reportedBy: createForm.reportedBy || undefined,
        phone: createForm.phone || undefined,
      });
      toast.success("Verification record created");
      setCreateOpen(false);
      setCreateForm({
        therapistId: "",
        documentType: "Practice license",
        expires: null,
        severity: undefined,
        reportedBy: "",
        phone: "",
      });
    } catch {
      toast.error("Failed to create verification");
    } finally {
      setCreateSaving(false);
    }
  }, [createForm, createVerif]);

  const handleAddTherapistSubmit = useCallback(async () => {
    if (!addTherapistForm.name || !addTherapistForm.email || !addTherapistForm.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    setAddTherapistSaving(true);
    try {
      await createTherapist({
        name: addTherapistForm.name,
        email: addTherapistForm.email,
        password: addTherapistForm.password,
        phone: addTherapistForm.phone || undefined,
        city: addTherapistForm.city,
        specialty: addTherapistForm.specialty,
        gender: addTherapistForm.gender,
        price: addTherapistForm.price,
        experience: addTherapistForm.experience,
        bio: addTherapistForm.bio || undefined,
        citizenshipNumber: addTherapistForm.citizenshipNumber || undefined,
        panNumber: addTherapistForm.panNumber || undefined,
        medicalLicenseUrl: addTherapistForm.medicalLicenseUrl || undefined,
        certificateUrl: addTherapistForm.certificateUrl || undefined,
      });
      toast.success(`Therapist ${addTherapistForm.name} added successfully`);
      setAddTherapistOpen(false);
      setAddTherapistForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        specialty: "",
        gender: "Male",
        price: 0,
        experience: 0,
        bio: "",
        citizenshipNumber: "",
        panNumber: "",
        medicalLicenseUrl: "",
        certificateUrl: "",
      });
    } catch {
      toast.error("Failed to add therapist");
    } finally {
      setAddTherapistSaving(false);
    }
  }, [addTherapistForm, createTherapist]);

  const columns: Column<AdminVerificationData>[] = useMemo(
    () => [
      {
        key: "therapist",
        label: "Therapist",
        sortable: true,
        render: (row) => <span className="font-medium">{row.therapist}</span>,
      },
      {
        key: "documentType",
        label: "Document",
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-text-light">{row.documentType}</span>
            <DocumentPreview verification={row} compact />
          </div>
        ),
      },
      {
        key: "uploaded",
        label: "Uploaded",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {formatDate(row.uploaded)}
          </span>
        ),
      },
      {
        key: "expires",
        label: "Expires",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-xs text-text-light">
            {row.expires ? formatDate(row.expires) : "—"}
          </span>
        ),
      },
      {
        key: "severity",
        label: "Severity",
        render: (row) =>
          row.severity ? (
            <StatusChip status={row.severity} />
          ) : (
            <span className="text-text-muted">—</span>
          ),
      },
      {
        key: "reportedBy",
        label: "Reported By",
        render: (row) => (
          <span className="text-text-light text-sm">
            {row.reportedBy ?? "—"}
          </span>
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
    (row: AdminVerificationData) => {
      const actions: ActionItem[] = [
        {
          key: "preview",
          label: "Preview",
          icon: <Eye size={14} />,
          onClick: () => setPreviewRow(row),
        },
        {
          key: "call",
          label: "Call",
          icon: <Phone size={14} />,
          onClick: () => handleCall(row),
        },
      ];

      if (row.status !== "Escalated") {
        actions.push({
          key: "escalate",
          label: "Escalate",
          icon: <AlertTriangle size={14} />,
          onClick: () => setEscalateRow(row),
        });
      }

      if (row.status === "Pending review") {
        actions.push({
          key: "review",
          label: "Review",
          icon: <Eye size={14} />,
          onClick: () => setReviewRow(row),
        });
        actions.push({
          key: "approve",
          label: "Approve",
          icon: <Check size={14} />,
          onClick: () => approveVerif(row.id),
        });
      } else if (row.status === "Expiring soon") {
        actions.push({
          key: "remind",
          label: "Remind",
          icon: <Send size={14} />,
          onClick: () => toast(`Reminder sent to ${row.therapist}`),
        });
      } else if (row.status === "Expired") {
        actions.push({
          key: "suspend",
          label: "Suspend",
          icon: <Ban size={14} />,
          variant: "destructive",
          onClick: () => {
            setLocalOverrides((prev) => ({
              ...prev,
              [row.id]: { ...prev[row.id], status: "Expired" },
            }));
            toast.success(`${row.therapist} bookings suspended`);
          },
        });
      }

      actions.push({
        key: "edit",
        label: "Edit",
        icon: <Pencil size={14} />,
        onClick: () => {
          setEditForm({
            documentType: row.documentType,
            status: row.status,
            severity: row.severity ?? "",
            expires: row.expires ?? "",
          });
          setEditRow(row);
        },
      });

      actions.push({
        key: "delete",
        label: "Delete",
        icon: <Trash2 size={14} />,
        variant: "destructive",
        onClick: () => setDeleteTarget(row),
      });

      return <ActionMenu actions={actions} />;
    },
    [approveVerif, handleCall],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: "Therapist",
        placeholder: "Search therapist…",
      },
      {
        key: "documentType",
        type: "select",
        label: "Document type",
        placeholder: "All types",
        options: [
          { value: "Practice license", label: "Practice license" },
          { value: "Government ID", label: "Government ID" },
          { value: "Certification", label: "Certification" },
        ],
      },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
          { value: "Pending review", label: "Pending review" },
          { value: "Verified", label: "Verified" },
          { value: "Expiring soon", label: "Expiring soon" },
          { value: "Expired", label: "Expired" },
          { value: "Rejected", label: "Rejected" },
          { value: "Escalated", label: "Escalated" },
        ],
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="font-display text-xl">Therapist Verification</h2>
          <p className="text-sm text-text-light mt-1">
            License, ID, and certificate checks — no one takes a home visit
            unverified.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAddTherapistOpen(true)}
            className="chip !bg-primary !text-white cursor-pointer"
          >
            <UserPlus size={14} className="inline mr-1" />
            Add Therapist
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="chip !bg-secondary !text-white cursor-pointer"
          >
            <Plus size={14} className="inline mr-1" />
            Add Verification
          </button>
          <RefreshButton onRefresh={() => refetch()} isRefreshing={isRefetching} />
        </div>
      </div>

      <div className="stats-grid">
        <DashboardStat
          label="Pending review"
          value="3"
          sub="Needs a decision"
          variant="amber"
        />
        <DashboardStat
          label="Verified this month"
          value="4"
          sub="All documents current"
        />
        <DashboardStat
          label="Expiring in 30 days"
          value="2"
          sub="License renewal due"
          variant="amber"
        />
        <DashboardStat
          label="Expired / rejected"
          value="1"
          sub="Suspended from bookings"
        />
      </div>

      <div className="card-soft p-5">
        <FilterBar
          filters={filterConfig}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={resetFilters}
        />

        <div className="mb-4">
          <button
            onClick={() => setFilterPanelOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filterPanelOpen || hasAdvancedFilters
                ? "bg-secondary text-white"
                : "text-text-light hover:text-text hover:bg-muted"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          {filterPanelOpen && (
            <div className="flex flex-wrap items-end gap-3 mt-3 p-3 bg-surface/50 rounded-xl">
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Severity
                </label>
                <Select
                  value={severityFilter}
                  onValueChange={(v) => {
                    setSeverityFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending review">
                      Pending review
                    </SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Expiring soon">
                      Expiring soon
                    </SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[0.65rem] uppercase font-mono text-text-light">
                  Reported By
                </label>
                <Select
                  value={reportedByFilter}
                  onValueChange={(v) => {
                    setReportedByFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-48 rounded-full border-border text-sm">
                    <SelectValue placeholder="All reporters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="System">System</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasAdvancedFilters && (
                <button
                  onClick={clearAdvancedFilters}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium text-text-light hover:text-text hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={itemsWithOverrides}
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
          rowClassName={(row) =>
            row.status === "Expiring soon" ||
            row.status === "Expired" ||
            row.status === "Escalated"
              ? "bg-primary/5"
              : undefined
          }
          emptyMessage="No verification records found"
        />
      </div>

      {previewRow && (
        <PreviewModal
          verification={previewRow}
          onClose={() => setPreviewRow(null)}
        />
      )}

      <ConfirmDialog
        open={!!escalateRow}
        onOpenChange={(open) => !open && setEscalateRow(null)}
        onConfirm={handleEscalate}
        title="Escalate this case?"
        description={`Escalate this verification case for <strong>${escalateRow?.therapist ?? ""}</strong> to the next review level?`}
      />

      {reviewRow && (
        <ReviewDrawer
          verification={reviewRow}
          onClose={() => setReviewRow(null)}
          onApprove={() => {
            approveVerif(reviewRow.id);
            setReviewRow(null);
          }}
          onReject={handleReject}
        />
      )}

      {editRow && (
        <EditDrawer
          verification={editRow}
          form={editForm}
          onFormChange={setEditForm}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
          saving={editSaving}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteSubmit}
        title="Delete this verification?"
        description={`Permanently delete the verification record for <strong>${deleteTarget?.therapist ?? ""}</strong> (${deleteTarget?.documentType ?? ""})? This action cannot be undone.`}
      />

      {addTherapistOpen && (
        <AddTherapistDrawer
          form={addTherapistForm}
          onFormChange={setAddTherapistForm}
          onClose={() => setAddTherapistOpen(false)}
          onSave={handleAddTherapistSubmit}
          saving={addTherapistSaving}
        />
      )}

      {createOpen && (
        <CreateVerificationDrawer
          form={createForm}
          onFormChange={setCreateForm}
          onClose={() => setCreateOpen(false)}
          onSave={handleCreateSubmit}
          saving={createSaving}
        />
      )}
    </div>
  );
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)$/i.test(url);
}

function formatFileSize(bytes?: number): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentPreview({
  verification,
  compact,
}: {
  verification: AdminVerificationData;
  compact?: boolean;
}) {
  const { documentUrl, fileName, fileSize } = verification;

  if (compact) {
    if (!documentUrl) return <span className="text-text-muted">—</span>;
    return (
      <a
        href={documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-xs text-secondary hover:underline"
      >
        <FileText size={12} /> {fileName ?? "View"}
      </a>
    );
  }

  if (!documentUrl) {
    return (
      <div className="bg-surface rounded-xl p-6 text-center text-text-muted text-sm">
        No document attached
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-3">
      {isImageUrl(documentUrl) ? (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-border bg-white"
        >
          <Image
            src={documentUrl}
            alt={fileName ?? verification.documentType}
            width={400}
            height={260}
            unoptimized
            className="w-full max-h-[260px] object-contain"
          />
        </a>
      ) : (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border border-dashed border-border bg-white text-text-light hover:text-secondary hover:border-secondary transition-colors"
        >
          <FileText size={32} className="text-secondary" />
          <span className="text-sm font-medium break-all px-4 text-center">
            {fileName ?? "Document"}
          </span>
          {fileSize != null && (
            <span className="text-xs font-mono text-text-light">
              {formatFileSize(fileSize)}
            </span>
          )}
        </a>
      )}
      <div className="flex items-center justify-between gap-2 mt-2 text-xs text-text-light">
        <span className="truncate">{fileName ?? verification.documentType}</span>
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-secondary hover:underline shrink-0"
        >
          <ExternalLink size={12} /> Open
        </a>
      </div>
    </div>
  );
}

function PreviewModal({
  verification,
  onClose,
}: {
  verification: AdminVerificationData;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Verification Details
          </DialogTitle>
          <DialogDescription>
            {verification.therapist} · {verification.documentType}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusChip status={verification.status} />
            {verification.severity && (
              <StatusChip status={verification.severity} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Document
              </span>
              <span>{verification.documentType}</span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Reported By
              </span>
              <span>{verification.reportedBy ?? "—"}</span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Uploaded
              </span>
              <span className="font-mono text-xs">
                {formatDate(verification.uploaded)}
              </span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Expires
              </span>
              <span className="font-mono text-xs">
                {verification.expires
                  ? formatDate(verification.expires)
                  : "No expiry"}
              </span>
            </div>
            {verification.phone && (
              <div>
                <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                  Phone
                </span>
                <span className="font-mono text-xs">
                  {verification.phone}
                </span>
              </div>
            )}
          </div>
          {verification.note && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-[0.65rem] uppercase font-mono text-destructive mb-1">
                Rejection reason
              </p>
              <p className="text-sm text-text">{verification.note}</p>
            </div>
          )}
          <DocumentPreview verification={verification} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDrawer({
  verification,
  onClose,
  onApprove,
  onReject,
}: {
  verification: AdminVerificationData;
  onClose: () => void;
  onApprove: () => void;
  onReject: (note: string) => void;
}) {
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const handleRejectClick = async () => {
    if (!rejectNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setRejecting(true);
    try {
      await onReject(rejectNote.trim());
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Review Document</SheetTitle>
          <SheetDescription>
            {verification.therapist} · {verification.documentType}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <StatusChip status={verification.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Uploaded
              </span>
              <span className="font-mono text-xs">
                {formatDate(verification.uploaded)}
              </span>
            </div>
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Expires
              </span>
              <span className="font-mono text-xs">
                {verification.expires
                  ? formatDate(verification.expires)
                  : "No expiry"}
              </span>
            </div>
          </div>
          <DocumentPreview verification={verification} />
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Rejection reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[80px]"
              placeholder="Explain why this document is being rejected — the therapist will see this reason and receive it by email."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="chip !bg-success !text-white cursor-pointer"
            >
              <Check size={12} className="inline mr-1" /> Approve
            </button>
            <button
              onClick={handleRejectClick}
              disabled={rejecting}
              className="chip !bg-destructive !text-white cursor-pointer disabled:opacity-50"
            >
              <X size={12} className="inline mr-1" />
              {rejecting ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditDrawer({
  verification,
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
}: {
  verification: AdminVerificationData;
  form: { documentType: string; status: string; severity: string; expires: string };
  onFormChange: (f: { documentType: string; status: string; severity: string; expires: string }) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Edit Verification</SheetTitle>
          <SheetDescription>
            {verification.therapist} · {verification.documentType}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Document Type
            </label>
            <Select
              value={form.documentType}
              onValueChange={(v) => onFormChange({ ...form, documentType: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Practice license">Practice license</SelectItem>
                <SelectItem value="Government ID">Government ID</SelectItem>
                <SelectItem value="Certification">Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Status
            </label>
            <Select
              value={form.status}
              onValueChange={(v) => onFormChange({ ...form, status: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending review">Pending review</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Expiring soon">Expiring soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Severity
            </label>
            <Select
              value={form.severity}
              onValueChange={(v) => onFormChange({ ...form, severity: v })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Expiry Date
            </label>
            <Input
              type="date"
              value={form.expires}
              onChange={(e) => onFormChange({ ...form, expires: e.target.value })}
              className="h-9 w-full rounded-full border-border text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="chip !bg-success !text-white cursor-pointer disabled:opacity-50"
            >
              <Check size={12} className="inline mr-1" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="chip cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CreateVerificationDrawer({
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
}: {
  form: CreateVerificationPayload;
  onFormChange: (f: CreateVerificationPayload) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Add Verification</SheetTitle>
          <SheetDescription>
            Create a new verification record for a therapist
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Therapist ID <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.therapistId}
              onChange={(e) => onFormChange({ ...form, therapistId: e.target.value })}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="Enter therapist ID"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Document Type
            </label>
            <Select
              value={form.documentType}
              onValueChange={(v) => onFormChange({ ...form, documentType: v as CreateVerificationPayload["documentType"] })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Practice license">Practice license</SelectItem>
                <SelectItem value="Government ID">Government ID</SelectItem>
                <SelectItem value="Certification">Certification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Severity
            </label>
            <Select
              value={form.severity ?? ""}
              onValueChange={(v) => onFormChange({ ...form, severity: (v || undefined) as CreateVerificationPayload["severity"] })}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Expiry Date
            </label>
            <Input
              type="date"
              value={form.expires ?? ""}
              onChange={(e) => onFormChange({ ...form, expires: e.target.value || null })}
              className="h-9 w-full rounded-full border-border text-sm"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Reported By
            </label>
            <Input
              value={form.reportedBy ?? ""}
              onChange={(e) => onFormChange({ ...form, reportedBy: e.target.value || undefined })}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. System, Admin, Patient"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Phone
            </label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => onFormChange({ ...form, phone: e.target.value || undefined })}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="+977-98XXXXXXXX"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              disabled={saving || !form.therapistId}
              className="chip !bg-success !text-white cursor-pointer disabled:opacity-50"
            >
              <Check size={12} className="inline mr-1" />
              {saving ? "Creating…" : "Create Verification"}
            </button>
            <button
              onClick={onClose}
              className="chip cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddTherapistDrawer({
  form,
  onFormChange,
  onClose,
  onSave,
  saving,
}: {
  form: AdminCreateTherapistPayload;
  onFormChange: (f: AdminCreateTherapistPayload) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const updateField = (field: keyof AdminCreateTherapistPayload, value: string | number) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Add New Therapist</SheetTitle>
          <SheetDescription>
            Create a new therapist account with all required verification details
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. Bikash Thapa"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. bikash@example.com"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Phone Number
            </label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="+977-98XXXXXXXX"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              City / Address <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. Kathmandu"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Specialist <span className="text-destructive">*</span>
            </label>
            <Select
              value={form.specialty}
              onValueChange={(v) => updateField("specialty", v)}
            >
              <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                <SelectItem value="Neurological">Neurological</SelectItem>
                <SelectItem value="Pediatric">Pediatric</SelectItem>
                <SelectItem value="Geriatric">Geriatric</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Cardiopulmonary">Cardiopulmonary</SelectItem>
                <SelectItem value="Musculoskeletal">Musculoskeletal</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
                Gender <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-full border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
                Year of Experience <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={0}
                value={form.experience || ""}
                onChange={(e) => updateField("experience", parseInt(e.target.value) || 0)}
                className="h-9 w-full rounded-full border-border text-sm"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Price per Session (NPR) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. 1500"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio ?? ""}
              onChange={(e) => updateField("bio", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm min-h-[60px]"
              placeholder="Short professional bio..."
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-text mb-3">Verification Documents</p>
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Citizenship Number
            </label>
            <Input
              value={form.citizenshipNumber ?? ""}
              onChange={(e) => updateField("citizenshipNumber", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. 12-34-56-78901"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              PAN Number
            </label>
            <Input
              value={form.panNumber ?? ""}
              onChange={(e) => updateField("panNumber", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="e.g. 123456789"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Medical License URL
            </label>
            <Input
              value={form.medicalLicenseUrl ?? ""}
              onChange={(e) => updateField("medicalLicenseUrl", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="Link to medical license document"
            />
          </div>

          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">
              Certificate URL
            </label>
            <Input
              value={form.certificateUrl ?? ""}
              onChange={(e) => updateField("certificateUrl", e.target.value)}
              className="h-9 w-full rounded-full border-border text-sm"
              placeholder="Link to certificate document"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              disabled={saving || !form.name || !form.email || !form.password}
              className="chip !bg-success !text-white cursor-pointer disabled:opacity-50"
            >
              <Check size={12} className="inline mr-1" />
              {saving ? "Creating…" : "Create Therapist"}
            </button>
            <button
              onClick={onClose}
              className="chip cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
