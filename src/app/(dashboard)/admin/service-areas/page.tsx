"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Pencil, UserPlus, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminServiceAreas } from "@/hooks/useAdminServiceAreas";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
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

export default function ServiceAreasPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminServiceAreaData | null>(null);
  const [detailRow, setDetailRow] = useState<AdminServiceAreaData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading } = useAdminServiceAreas({
    search: debouncedSearch,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, []);

  const filterValues = useMemo(() => ({ search, status }), [search, status]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "status") setStatus(value);
      setPage(1);
    },
    [],
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
        {row.status === "Low coverage" ? (
          <button
            className="chip !bg-secondary !text-white cursor-pointer !text-[0.6rem]"
            title="Assign therapist"
          >
            <UserPlus size={12} className="inline mr-1" /> Assign
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditRow(row)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
              title="Edit zone"
            >
              <Pencil size={15} />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
              title="Assign therapist"
            >
              <UserPlus size={15} />
            </button>
          </>
        )}
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
          <button onClick={() => setAddOpen(true)} className="btn-primary !py-2 !px-3 text-xs cursor-pointer">
            <Plus size={14} className="inline mr-1" /> + Add zone
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardStat label="Active zones" value="6" sub="Across Kathmandu Valley" />
        <DashboardStat label="Low coverage zones" value="1" sub="Fewer than 2 therapists" variant="amber" />
        <DashboardStat label="Uncovered requests" value="4" sub="This week" />
        <DashboardStat label="Avg therapists / zone" value="2.8" sub="↑ 0.3 vs last month" />
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
          rowClassName={(row) => row.status === "Low coverage" ? "bg-destructive/5" : undefined}
          emptyMessage="No service areas found"
        />
      </div>

      {addOpen && <ZoneForm onClose={() => setAddOpen(false)} />}
      {editRow && <ZoneForm zone={editRow} onClose={() => setEditRow(null)} />}
      {detailRow && <ZoneDetail zone={detailRow} onClose={() => setDetailRow(null)} />}
    </div>
  );
}

function ZoneForm({ zone, onClose }: { zone?: AdminServiceAreaData; onClose: () => void }) {
  const [name, setName] = useState(zone?.name ?? "");
  const [localities, setLocalities] = useState(zone?.localities.join(", ") ?? "");

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">{zone ? "Edit Zone" : "Add Zone"}</SheetTitle>
          <SheetDescription>
            {zone ? "Update localities and therapist assignments" : "Create a new coverage zone"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
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
          <div>
            <label className="text-[0.65rem] uppercase font-mono text-text-light block mb-1.5">Assign therapists (optional)</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              placeholder="Search therapist to assign…"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary !py-2 !px-4 text-xs cursor-pointer">
              {zone ? "Save changes" : "Create zone"}
            </button>
            <button onClick={onClose} className="btn-outline !py-2 !px-4 text-xs cursor-pointer">Cancel</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ZoneDetail({ zone, onClose }: { zone: AdminServiceAreaData; onClose: () => void }) {
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
          <div>
            <span className="text-[0.65rem] uppercase font-mono text-text-light block mb-2">Recent bookings in this zone</span>
            <div className="space-y-2">
              <div className="text-sm bg-surface rounded-xl p-3 flex items-center justify-between">
                <span>BKG-1042 — Hari Bahadur Rai</span>
                <span className="font-mono text-xs text-text-light">Jul 12</span>
              </div>
              <div className="text-sm bg-surface rounded-xl p-3 flex items-center justify-between">
                <span>BKG-1018 — Puja Maharjan</span>
                <span className="font-mono text-xs text-text-light">Jul 10</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
