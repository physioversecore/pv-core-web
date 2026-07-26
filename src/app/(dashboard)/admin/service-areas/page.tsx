"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Pencil, Trash2, UserPlus, Filter } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminServiceAreas } from "@/hooks/useAdminServiceAreas";
import { getAdminTherapists, type AdminTherapistData } from "@/services/api/admin";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminServiceAreaData } from "@/services/api/admin";
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

export default function ServiceAreasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminServiceAreaData | null>(null);
  const [detailRow, setDetailRow] = useState<AdminServiceAreaData | null>(null);
  const [assignRow, setAssignRow] = useState<AdminServiceAreaData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceAreaData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, allItems, total, isLoading, createArea, updateArea, deleteArea, assignTherapist } =
    useAdminServiceAreas({
      search: debouncedSearch,
      status,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });

  const activeZones = useMemo(() => allItems.filter((r) => r.status === "Active").length, [allItems]);
  const lowCoverageZones = useMemo(() => allItems.filter((r) => r.status === "Low coverage").length, [allItems]);
  const totalBookings = useMemo(() => allItems.reduce((sum, r) => sum + r.bookingsThisMonth, 0), [allItems]);
  const avgTherapists = useMemo(
    () => (allItems.length ? (allItems.reduce((s, r) => s + r.assignedTherapists, 0) / allItems.length).toFixed(1) : "0"),
    [allItems],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, []);

  const filterValues = useMemo(() => ({ search, status }), [search, status]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "search") setSearch(value);
    else if (key === "status") setStatus(value);
    setPage(1);
  }, []);

  const handleCreate = useCallback(
    async (data: { name: string; localities: string[]; therapistIds?: string[] }) => {
      try {
        await createArea(data);
        toast.success("Zone created");
        setAddOpen(false);
      } catch {
        toast.error("Something went wrong");
      }
    },
    [createArea],
  );

  const handleEditSave = useCallback(
    async (data: { name: string; localities: string[] }) => {
      if (!editRow) return;
      try {
        await updateArea(editRow.id, data);
        toast.success("Zone updated");
        setEditRow(null);
      } catch {
        toast.error("Something went wrong");
      }
    },
    [editRow, updateArea],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteArea(deleteTarget.id);
      toast.success("Zone deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Something went wrong");
    }
  }, [deleteTarget, deleteArea]);

  const handleAssign = useCallback(
    async (zoneId: string, therapistId: string) => {
      try {
        await assignTherapist(zoneId, therapistId);
        toast.success("Therapist assigned");
        setAssignRow(null);
      } catch {
        toast.error("Something went wrong");
      }
    },
    [assignTherapist],
  );

  const columns: Column<AdminServiceAreaData>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Zone",
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
        key: "localities",
        label: "Localities covered",
        render: (row) => (
          <div className="flex flex-wrap gap-1">
            {row.localities.map((l) => (
              <span key={l} className="chip !text-[0.6rem]">{l}</span>
            ))}
          </div>
        ),
      },
      {
        key: "assignedTherapists",
        label: "Assigned therapists",
        sortable: true,
        render: (row) => <span className="font-mono text-sm">{row.assignedTherapists}</span>,
      },
      {
        key: "bookingsThisMonth",
        label: "Bookings this month",
        sortable: true,
        render: (row) => <span className="font-mono text-sm">{row.bookingsThisMonth}</span>,
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
    (row: AdminServiceAreaData) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setEditRow(row)}
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
          title="Edit zone"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => setAssignRow(row)}
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
          title="Assign therapist"
        >
          <UserPlus size={15} />
        </button>
        <button
          onClick={() => setDeleteTarget(row)}
          className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-destructive transition cursor-pointer"
          title="Delete zone"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
    [],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { key: "search", type: "search", label: "Zone", placeholder: "Search zone or locality…" },
      {
        key: "status",
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
          { value: "Active", label: "Active" },
          { value: "Low coverage", label: "Low coverage" },
        ],
      },
    ],
    [],
  );

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-xl">Service Areas</h2>
            <p className="text-sm text-text-light mt-1">
              Coverage zones — so bookings are never assigned somewhere no therapist can actually reach.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline !py-2 !px-3 text-xs cursor-pointer ${showFilters ? "!bg-secondary !text-white" : ""}`}
            >
              <Filter size={14} className="inline mr-1" /> Filter
            </button>
            <button onClick={() => setAddOpen(true)} className="btn-primary !py-2 !px-3 text-xs cursor-pointer">
              <Plus size={14} className="inline mr-1" /> Add zone
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Active zones" value={String(activeZones)} sub="Across Nepal" />
        <DashboardStat label="Low coverage zones" value={String(lowCoverageZones)} sub="Fewer than 2 therapists" variant="amber" />
        <DashboardStat label="Total bookings" value={String(totalBookings)} sub="This month" />
        <DashboardStat label="Avg therapists / zone" value={avgTherapists} sub="Across all zones" />
      </div>

      <div className="card-soft p-5">
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
          onSortToggle={(col) => { toggleSort(col); setPage(1); }}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          renderActions={renderActions}
          rowClassName={(row) => row.status === "Low coverage" ? "bg-destructive/5" : undefined}
          emptyMessage="No service areas found"
        />
      </div>

      {addOpen && (
        <ZoneForm
          onClose={() => setAddOpen(false)}
          onSubmit={handleCreate}
        />
      )}
      {editRow && (
        <ZoneForm
          zone={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={handleEditSave}
        />
      )}
      {detailRow && (
        <ZoneDetail
          zone={detailRow}
          onClose={() => setDetailRow(null)}
          onEdit={(z) => { setDetailRow(null); setEditRow(z); }}
          onAssign={(z) => { setDetailRow(null); setAssignRow(z); }}
          onDelete={(z) => { setDetailRow(null); setDeleteTarget(z); }}
        />
      )}
      {assignRow && (
        <AssignTherapistDialog
          zone={assignRow}
          onClose={() => setAssignRow(null)}
          onAssign={handleAssign}
        />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete zone"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
      />
    </div>
  );
}

function ZoneForm({
  zone,
  onClose,
  onSubmit,
}: {
  zone?: AdminServiceAreaData;
  onClose: () => void;
  onSubmit: (data: { name: string; localities: string[]; therapistIds?: string[] }) => Promise<void>;
}) {
  const [name, setName] = useState(zone?.name ?? "");
  const [localities, setLocalities] = useState(zone?.localities.join(", ") ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        name,
        localities: localities.split(",").map((l) => l.trim()).filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{zone ? "Edit Zone" : "Add Zone"}</DialogTitle>
          <DialogDescription>
            {zone ? "Update localities and therapist assignments" : "Create a new coverage zone"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Zone name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              placeholder="e.g. Kathmandu Central"
            />
          </div>
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Localities (comma separated)</label>
            <input
              value={localities}
              onChange={(e) => setLocalities(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              placeholder="e.g. Baneshwor, New Baneshwor, Koteshwor"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={saving || !name.trim()}
              className="btn-primary !py-2 !px-4 text-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving…" : zone ? "Save changes" : "Create zone"}
            </button>
            <button onClick={onClose} className="btn-outline !py-2 !px-4 text-xs cursor-pointer">Cancel</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssignTherapistDialog({
  zone,
  onClose,
  onAssign,
}: {
  zone: AdminServiceAreaData;
  onClose: () => void;
  onAssign: (zoneId: string, therapistId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [therapists, setTherapists] = useState<AdminTherapistData[]>([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingTherapists(true);
    getAdminTherapists({ limit: 100 })
      .then((res) => {
        if (!cancelled) setTherapists(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingTherapists(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const list = therapists.filter((t) => t.status === "Verified" && t.isActive);
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q),
    );
  }, [therapists, search]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await onAssign(zone.id, selectedId);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Assign Therapist</DialogTitle>
          <DialogDescription>
            Select a therapist to assign to <strong>{zone.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Search therapist</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              placeholder="Search by name or specialty…"
            />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoadingTherapists && (
              <p className="text-sm text-text-light text-center py-4">Loading therapists…</p>
            )}
            {!isLoadingTherapists && filtered.length === 0 && (
              <p className="text-sm text-text-light text-center py-4">No therapists found</p>
            )}
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  selectedId === t.id
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-xs text-text-light ml-2">{t.specialty}</span>
                    {t.city && (
                      <span className="text-xs text-text-light ml-2">· {t.city}</span>
                    )}
                  </div>
                  {selectedId === t.id && (
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleConfirm}
              disabled={!selectedId || saving}
              className="btn-primary !py-2 !px-4 text-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? "Assigning…" : "Confirm assignment"}
            </button>
            <button onClick={onClose} className="btn-outline !py-2 !px-4 text-xs cursor-pointer">Cancel</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ZoneDetail({
  zone,
  onClose,
  onEdit,
  onAssign,
  onDelete,
}: {
  zone: AdminServiceAreaData;
  onClose: () => void;
  onEdit: (zone: AdminServiceAreaData) => void;
  onAssign: (zone: AdminServiceAreaData) => void;
  onDelete: (zone: AdminServiceAreaData) => void;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{zone.name}</SheetTitle>
          <SheetDescription>
            <StatusChip status={zone.status} />
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">Localities covered</span>
            <div className="flex flex-wrap gap-1.5">
              {zone.localities.map((l) => (
                <span key={l} className="chip">{l}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-soft p-4">
              <div className="eyebrow mb-1">Assigned therapists</div>
              <div className="stat-value">{zone.assignedTherapists}</div>
            </div>
            <div className="card-soft p-4">
              <div className="eyebrow mb-1">Bookings this month</div>
              <div className="stat-value">{zone.bookingsThisMonth}</div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit(zone)}
              className="btn-primary !py-2 !px-4 text-xs cursor-pointer"
            >
              <Pencil size={14} className="inline mr-1" /> Edit zone
            </button>
            <button
              onClick={() => onAssign(zone)}
              className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
            >
              <UserPlus size={14} className="inline mr-1" /> Assign therapist
            </button>
            <button
              onClick={() => onDelete(zone)}
              className="btn-outline !py-2 !px-4 text-xs cursor-pointer !text-destructive hover:!bg-destructive/10"
            >
              <Trash2 size={14} className="inline mr-1" /> Delete
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
