"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  Shield,
  Eye,
  Pencil,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPerformance } from "@/hooks/useAdminPerformance";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  ActionMenu,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import type { AdminPerformanceData } from "@/services/api/admin";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EDIT_STATUSES = [
  "Good standing",
  "Needs review",
  "Under probation",
  "Escalated",
  "Resolved",
] as const;

export default function PerformancePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<AdminPerformanceData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const [previewRow, setPreviewRow] = useState<AdminPerformanceData | null>(null);
  const [editRow, setEditRow] = useState<AdminPerformanceData | null>(null);
  const [resolveRow, setResolveRow] = useState<AdminPerformanceData | null>(null);
  const [deleteRow, setDeleteRow] = useState<AdminPerformanceData | null>(null);
  const [scheduleRow, setScheduleRow] = useState<AdminPerformanceData | null>(null);

  const {
    items,
    total,
    isLoading,
    updatePerformance,
    resolvePerformance,
    deletePerformance,
    scheduleReview,
  } = useAdminPerformance({
    search: debouncedSearch,
    status,
    minRating,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const handleSaveEdit = useCallback(
    async (updated: AdminPerformanceData) => {
      try {
        await updatePerformance(updated.id, {
          name: updated.name,
          avgRating: updated.avgRating,
          sessions: updated.sessions,
          reviews: updated.reviews,
          trend: updated.trend,
          linkedComplaints: updated.linkedComplaints,
          status: updated.status,
        });
        setEditRow(null);
        toast.success(`${updated.name}'s profile updated`);
      } catch {
        toast.error("Failed to update profile");
      }
    },
    [updatePerformance],
  );

  const handleResolve = useCallback(
    async (row: AdminPerformanceData) => {
      try {
        await resolvePerformance(row.id);
        setResolveRow(null);
        toast.success(`${row.name} marked as resolved`);
      } catch {
        toast.error("Failed to resolve therapist");
      }
    },
    [resolvePerformance],
  );

  const handleDelete = useCallback(
    async (row: AdminPerformanceData) => {
      try {
        await deletePerformance(row.id);
        setDeleteRow(null);
        toast.success(`${row.name} removed from the team`);
      } catch {
        toast.error("Failed to remove therapist");
      }
    },
    [deletePerformance],
  );

  const handleScheduleReview = useCallback(
    async (row: AdminPerformanceData, date: string) => {
      try {
        await scheduleReview(row.id, {
          date,
          adminId: "current-admin",
          notes: `Review scheduled for ${row.name}`,
        });
        setScheduleRow(null);
        toast.success(`Review scheduled for ${row.name}`);
      } catch {
        toast.error("Failed to schedule review");
      }
    },
    [scheduleReview],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setMinRating("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, status, minRating }),
    [search, status, minRating],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "status") setStatus(value);
      else if (key === "minRating") setMinRating(value);
      setPage(1);
    },
    [],
  );

  const columns: Column<AdminPerformanceData>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Therapist",
        sortable: true,
        render: (row) => (
          <button
            onClick={() => setDetailRow(row)}
            className="font-medium text-secondary hover:underline cursor-pointer"
          >
            {row.name}
          </button>
        ),
      },
      {
        key: "avgRating",
        label: "Avg rating",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.round(row.avgRating) ? "fill-primary text-primary" : "text-border"}
                />
              ))}
            </div>
            <span className="font-mono text-sm">{row.avgRating.toFixed(1)}</span>
          </div>
        ),
      },
      {
        key: "sessions",
        label: "Sessions",
        sortable: true,
        render: (row) => <span className="font-mono text-sm">{row.sessions}</span>,
      },
      {
        key: "reviews",
        label: "Reviews",
        sortable: true,
        render: (row) => <span className="font-mono text-sm">{row.reviews}</span>,
      },
      {
        key: "trend",
        label: "Trend",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-1">
            {row.trend > 0 ? (
              <TrendingUp size={14} className="text-success" />
            ) : row.trend < 0 ? (
              <TrendingDown size={14} className="text-destructive" />
            ) : (
              <Minus size={14} className="text-text-muted" />
            )}
            <span className={`font-mono text-xs ${row.trend > 0 ? "text-success" : row.trend < 0 ? "text-destructive" : "text-text-muted"}`}>
              {row.trend > 0 ? "+" : ""}{row.trend.toFixed(1)}
            </span>
          </div>
        ),
      },
      {
        key: "linkedComplaints",
        label: "Complaints",
        sortable: true,
        render: (row) => (
          <span className="font-mono text-sm">{row.linkedComplaints}</span>
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
    (row: AdminPerformanceData) => {
      const actions: ActionItem[] = [
        {
          key: "preview",
          label: "Preview",
          icon: <Eye size={14} />,
          onClick: () => setPreviewRow(row),
        },
        {
          key: "edit",
          label: "Edit",
          icon: <Pencil size={14} />,
          onClick: () => setEditRow(row),
        },
        ...(row.status === "Needs review" || row.status === "Under probation"
          ? [
              {
                key: "resolve",
                label: "Resolve",
                icon: <CheckCircle size={14} />,
                onClick: () => setResolveRow(row),
              },
            ]
          : []),
        ...(row.status === "Good standing"
          ? [
              {
                key: "history",
                label: "View history",
                icon: <Shield size={14} />,
                onClick: () => setDetailRow(row),
              },
            ]
          : []),
        ...(row.status === "Needs review"
          ? [
              {
                key: "schedule",
                label: "Schedule review",
                icon: <Calendar size={14} />,
                onClick: () => setScheduleRow(row),
              },
            ]
          : []),
        {
          key: "delete",
          label: "Delete",
          icon: <Trash2 size={14} />,
          variant: "destructive",
          onClick: () => setDeleteRow(row),
        },
      ];
      return <ActionMenu actions={actions} />;
    },
    [],
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
          { value: "Good standing", label: "Good standing" },
          { value: "Needs review", label: "Needs review" },
          { value: "Under probation", label: "Under probation" },
          { value: "Removed", label: "Removed" },
        ],
      },
      { key: "minRating", type: "search", label: "Min rating", placeholder: "e.g. 4.5" },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="font-display text-xl">Therapist Performance</h2>
          <p className="text-sm text-text-light mt-1">
            Automatically flags therapists whose average rating falls below the 4.5 quality threshold.
          </p>
        </div>
        <button className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
          <Download size={14} className="inline mr-1" /> Export report
        </button>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Team average rating" value="4.6" sub="↑ 0.1 vs last month" />
        <DashboardStat label="Below threshold (<4.5)" value="2" sub="Flagged for review" variant="amber" />
        <DashboardStat label="Reviews this month" value="86" sub="Across 12 therapists" />
        <DashboardStat label="Pending reviews" value="1" sub="Scheduled with Bikash Thapa" />
      </div>

      <div className="card-soft p-4 mb-5 text-sm text-text-light bg-primary-light border border-primary/20 rounded-xl">
        <strong className="text-text">Quality threshold: 4.5.</strong>{" "}
        Therapists averaging below this across their last 30 reviews are auto-flagged below. Schedule a review first; only remove from the team if performance doesn&apos;t improve or a serious complaint is confirmed.
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
          rowClassName={(row) => row.avgRating < 4.5 ? "bg-primary/5" : undefined}
          emptyMessage="No therapists found"
        />
      </div>

      {detailRow && <PerformanceDetailDrawer data={detailRow} onClose={() => setDetailRow(null)} />}

      {previewRow && (
        <PreviewModal row={previewRow} onClose={() => setPreviewRow(null)} />
      )}

      {editRow && (
        <EditModal row={editRow} onSave={handleSaveEdit} onClose={() => setEditRow(null)} />
      )}

      {resolveRow && (
        <ResolveConfirmModal
          row={resolveRow}
          onConfirm={() => handleResolve(resolveRow)}
          onClose={() => setResolveRow(null)}
        />
      )}

      {deleteRow && (
        <DeleteConfirmModal
          row={deleteRow}
          onConfirm={() => handleDelete(deleteRow)}
          onClose={() => setDeleteRow(null)}
        />
      )}

      {scheduleRow && (
        <ScheduleReviewModal
          row={scheduleRow}
          onConfirm={(date) => handleScheduleReview(scheduleRow, date)}
          onClose={() => setScheduleRow(null)}
        />
      )}
    </div>
  );
}

/* ── Preview Modal ─────────────────────────────────────────────── */

function PreviewModal({
  row,
  onClose,
}: {
  row: AdminPerformanceData;
  onClose: () => void;
}) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Avg rating", value: <span className="font-mono">{row.avgRating.toFixed(1)}</span> },
    { label: "Status", value: <StatusChip status={row.status} /> },
    { label: "Sessions", value: <span className="font-mono">{row.sessions}</span> },
    { label: "Reviews", value: <span className="font-mono">{row.reviews}</span> },
    {
      label: "Trend",
      value: (
        <span className={`font-mono ${row.trend > 0 ? "text-success" : row.trend < 0 ? "text-destructive" : "text-text-muted"}`}>
          {row.trend > 0 ? "+" : ""}{row.trend.toFixed(1)}
        </span>
      ),
    },
    { label: "Linked complaints", value: <span className="font-mono">{row.linkedComplaints}</span> },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{row.name}</DialogTitle>
          <DialogDescription>Therapist performance details</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <span className="eyebrow mb-1 block">{f.label}</span>
              <div className="text-sm">{f.value}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Edit Modal ────────────────────────────────────────────────── */

function EditModal({
  row,
  onSave,
  onClose,
}: {
  row: AdminPerformanceData;
  onSave: (updated: AdminPerformanceData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(row);

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Edit {row.name}</DialogTitle>
          <DialogDescription>Update therapist performance data</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="eyebrow mb-1 block">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-1 block">Avg rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.avgRating}
                onChange={(e) => setForm({ ...form, avgRating: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="eyebrow mb-1 block">Sessions</label>
              <input
                type="number"
                min="0"
                value={form.sessions}
                onChange={(e) => setForm({ ...form, sessions: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-1 block">Reviews</label>
              <input
                type="number"
                min="0"
                value={form.reviews}
                onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="eyebrow mb-1 block">Trend</label>
              <input
                type="number"
                step="0.1"
                value={form.trend}
                onChange={(e) => setForm({ ...form, trend: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="eyebrow mb-1 block">Linked complaints</label>
              <input
                type="number"
                min="0"
                value={form.linkedComplaints}
                onChange={(e) => setForm({ ...form, linkedComplaints: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="eyebrow mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as AdminPerformanceData["status"] })
                }
                className={inputClass}
              >
                {EDIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(form)}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Resolve Confirm Modal ─────────────────────────────────────── */

function ResolveConfirmModal({
  row,
  onConfirm,
  onClose,
}: {
  row: AdminPerformanceData;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Mark {row.name} as resolved?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Status will change to Good Standing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Resolve</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ── Delete Confirm Modal ──────────────────────────────────────── */

function DeleteConfirmModal({
  row,
  onConfirm,
  onClose,
}: {
  row: AdminPerformanceData;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Remove {row.name} from the team?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Remove
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ── Schedule Review Modal ─────────────────────────────────────── */

function ScheduleReviewModal({
  row,
  onConfirm,
  onClose,
}: {
  row: AdminPerformanceData;
  onConfirm: (date: string) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState("");

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule review for {row.name}</DialogTitle>
          <DialogDescription>Select a date for the performance review</DialogDescription>
        </DialogHeader>
        <div>
          <label className="eyebrow mb-1 block">Review date</label>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Select a date"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => date && onConfirm(date)} disabled={!date}>
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Detail Drawer ─────────────────────────────────────────────── */

function PerformanceDetailDrawer({ data, onClose }: { data: AdminPerformanceData; onClose: () => void }) {
  const ratingHistory = [
    { month: "Jun", rating: data.avgRating + 0.2 },
    { month: "May", rating: data.avgRating + 0.1 },
    { month: "Apr", rating: data.avgRating + 0.3 },
    { month: "Mar", rating: data.avgRating },
    { month: "Feb", rating: data.avgRating - 0.1 },
  ];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{data.name}</SheetTitle>
          <SheetDescription>
            <StatusChip status={data.status} />
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-soft p-4">
              <div className="eyebrow mb-1">Avg rating</div>
              <div className="stat-value">{data.avgRating.toFixed(1)}★</div>
            </div>
            <div className="card-soft p-4">
              <div className="eyebrow mb-1">Sessions</div>
              <div className="stat-value">{data.sessions}</div>
            </div>
          </div>
          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">Rating history</span>
            <div className="space-y-1.5">
              {ratingHistory.map((h) => (
                <div key={h.month} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs text-text-light w-8">{h.month}</span>
                  <div className="flex-1 bg-surface rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${(h.rating / 5) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8 text-right">{h.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">Recent reviews</span>
            <div className="space-y-2">
              <div className="text-sm bg-surface rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < 5 ? "fill-primary text-primary" : "text-border"} />
                  ))}
                </div>
                &quot;Very professional and punctual. Helped me with my back pain significantly.&quot;
              </div>
              <div className="text-sm bg-surface rounded-xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < 4 ? "fill-primary text-primary" : "text-border"} />
                  ))}
                </div>
                &quot;Good session but arrived a bit late.&quot;
              </div>
            </div>
          </div>
          {data.linkedComplaints > 0 && (
            <div>
              <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-1">
                Linked complaints ({data.linkedComplaints})
              </span>
              <button className="text-sm text-secondary hover:underline cursor-pointer">
                View complaints →
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
