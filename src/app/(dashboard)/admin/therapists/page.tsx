"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import { Star, Download, Pencil, Trash2, ShieldCheck, ShieldOff, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/context/i18n";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminTherapists } from "@/hooks/useAdminTherapists";
import {
  DataTable,
  ActionMenu,
  ConfirmDialog,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
  type ActionItem,
} from "@/components/tables";
import type { AdminTherapistData } from "@/services/api/admin";

export default function AdminTherapists() {
  const { t } = useLang();

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<AdminTherapistData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminTherapistData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading, deleteTherapist, toggleTherapistStatus, updateTherapist } = useAdminTherapists({
    search: debouncedSearch,
    specialty,
    status,
    city,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  const resetFilters = useCallback(() => {
    setSearch("");
    setSpecialty("");
    setStatus("");
    setCity("");
    setPage(1);
  }, []);

  const filterValues = useMemo(
    () => ({ search, specialty, status, city }),
    [search, specialty, status, city],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      if (key === "search") setSearch(value);
      else if (key === "specialty") setSpecialty(value);
      else if (key === "status") setStatus(value);
      else if (key === "city") setCity(value);
      setPage(1);
    },
    [],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteTherapist(deleteTarget.id);
      toast.success(t("admin_dashboard.therapistDeleted") ?? "Therapist deleted");
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.tryAgain") ?? "Something went wrong");
    }
  }, [deleteTarget, deleteTherapist, t]);

  const handleToggleStatus = useCallback(
    async (row: AdminTherapistData) => {
      const nextStatus: AdminTherapistData["status"] = row.isActive ? "Suspended" : "Verified";
      try {
        await toggleTherapistStatus(row.id, nextStatus);
        toast.success(
          row.isActive
            ? (t("admin_dashboard.therapistDeactivated") ?? "Therapist deactivated")
            : (t("admin_dashboard.therapistActivated") ?? "Therapist activated"),
        );
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [toggleTherapistStatus, t],
  );

  const handleEditSave = useCallback(
    async (data: Partial<AdminTherapistData>) => {
      if (!editRow) return;
      try {
        await updateTherapist(editRow.id, data);
        toast.success(t("admin_dashboard.saved") ?? "Saved");
        setEditRow(null);
      } catch {
        toast.error(t("common.tryAgain") ?? "Something went wrong");
      }
    },
    [editRow, updateTherapist, t],
  );

  const exportCsv = useCallback(() => {
    const header = "Name,City,Specialty,Rating,Sessions,Status,Phone,Email\n";
    const body = items
      .map(
        (r) =>
          `${r.name},${r.city},${r.specialty},${r.rating},${r.sessions},${r.status},${r.phone ?? ""},${r.email ?? ""}`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "therapists.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin_dashboard.exportedCsv") ?? "Exported CSV");
  }, [items, t]);

  const columns: Column<AdminTherapistData>[] = useMemo(
    () => [
      {
        key: "name",
        label: t("admin_dashboard.name") ?? "Name",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <Avatar name={row.name} size={28} />
            <div className="flex flex-col">
              <span className="font-medium">{row.name}</span>
              {row.email && <span className="text-xs text-text-light">{row.email}</span>}
            </div>
          </div>
        ),
      },
      {
        key: "city",
        label: t("admin_dashboard.city") ?? "City",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.city}</span>,
      },
      {
        key: "specialty",
        label: t("admin_dashboard.specialty") ?? "Specialty",
        sortable: true,
        render: (row) => <span className="text-text-light">{row.specialty}</span>,
      },
      {
        key: "rating",
        label: t("admin_dashboard.rating") ?? "Rating",
        sortable: true,
        render: (row) => (
          <span className="inline-flex items-center gap-1 text-primary">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={11} className={n <= Math.round(row.rating) ? "fill-primary text-primary" : "text-border"} />
            ))}
            <span className="ml-1 text-text font-mono text-xs">{row.rating}</span>
          </span>
        ),
      },
      {
        key: "sessions",
        label: t("admin_dashboard.sessions") ?? "Sessions",
        sortable: true,
        render: (row) => <span className="font-mono text-xs">{row.sessions}</span>,
      },
      {
        key: "joined",
        label: t("admin_dashboard.joined") ?? "Joined",
        sortable: true,
        render: (row) => <span className="text-text-light text-xs">{row.joined}</span>,
      },
      {
        key: "status",
        label: t("admin_dashboard.status") ?? "Status",
        sortable: true,
        render: (row) => <StatusChip status={row.status} />,
      },
    ],
    [t],
  );

  const renderActions = useCallback(
    (row: AdminTherapistData) => {
      const actions: ActionItem[] = [
        {
          key: "edit",
          label: t("admin_dashboard.edit") ?? "Edit",
          icon: <Pencil size={14} />,
          onClick: () => setEditRow(row),
        },
        {
          key: "toggle",
          label: row.isActive
            ? (t("admin_dashboard.deactivate") ?? "Deactivate")
            : (t("admin_dashboard.activate") ?? "Activate"),
          icon: row.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />,
          onClick: () => handleToggleStatus(row),
        },
        {
          key: "delete",
          label: t("admin_dashboard.delete") ?? "Delete",
          icon: <Trash2 size={14} />,
          variant: "destructive",
          onClick: () => setDeleteTarget(row),
        },
      ];
      return <ActionMenu actions={actions} />;
    },
    [handleToggleStatus, t],
  );

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "search",
        type: "search",
        label: t("admin_dashboard.name") ?? "Name",
        placeholder: t("admin_dashboard.searchTherapist") ?? "Search therapist...",
      },
      {
        key: "specialty",
        type: "select",
        label: t("admin_dashboard.specialty") ?? "Specialty",
        placeholder: t("admin_dashboard.allSpecialties") ?? "All specialties",
        options: [
          { value: "Sports & post-surgery", label: "Sports & post-surgery" },
          { value: "Geriatric & neuro", label: "Geriatric & neuro" },
          { value: "Musculoskeletal", label: "Musculoskeletal" },
          { value: "Pediatric rehab", label: "Pediatric rehab" },
          { value: "Sports injury", label: "Sports injury" },
        ],
      },
      {
        key: "status",
        type: "select",
        label: t("admin_dashboard.status") ?? "Status",
        placeholder: t("admin_dashboard.allStatuses") ?? "All statuses",
        options: [
          { value: "Verified", label: "Verified" },
          { value: "Under review", label: "Under review" },
          { value: "Suspended", label: "Suspended" },
        ],
      },
      {
        key: "city",
        type: "select",
        label: t("admin_dashboard.city") ?? "City",
        placeholder: t("admin_dashboard.allCities") ?? "All cities",
        options: [
          { value: "Kathmandu", label: "Kathmandu" },
          { value: "Lalitpur", label: "Lalitpur" },
          { value: "Bhaktapur", label: "Bhaktapur" },
          { value: "Pokhara", label: "Pokhara" },
        ],
      },
    ],
    [t],
  );

  return (
    <div>
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="font-display text-xl">{t("admin_dashboard.allTherapists") ?? "All Therapists"}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline !py-2 !px-3 text-xs cursor-pointer ${showFilters ? "!bg-secondary !text-white" : ""}`}
            >
              <Filter size={14} className="inline mr-1" /> Filter
            </button>
            <button onClick={exportCsv} className="btn-outline !py-2 !px-3 text-xs cursor-pointer">
              <Download size={14} className="inline mr-1" /> {t("admin_dashboard.exportCsv") ?? "Export CSV"}
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
          renderActions={renderActions}
          emptyMessage={t("common.noResults") ?? "No results found"}
        />
      </div>

      {editRow && (
        <EditTherapistDialog
          therapist={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("common.delete") ?? "Delete therapist"}
        description={`${t("common.confirm") ?? "Are you sure you want to delete"} ${deleteTarget?.name ?? ""}?`}
      />
    </div>
  );
}

function EditTherapistDialog({
  therapist,
  onClose,
  onSave,
}: {
  therapist: AdminTherapistData;
  onClose: () => void;
  onSave: (data: Partial<AdminTherapistData>) => Promise<void>;
}) {
  const { t } = useLang();
  const [name, setName] = useState(therapist.name);
  const [city, setCity] = useState(therapist.city);
  const [specialty, setSpecialty] = useState(therapist.specialty);
  const [phone, setPhone] = useState(therapist.phone ?? "");
  const [email, setEmail] = useState(therapist.email ?? "");
  const [status, setStatus] = useState<AdminTherapistData["status"]>(therapist.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        city,
        specialty,
        phone,
        email,
        status,
        isActive: status === "Verified",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg mb-4">{t("admin_dashboard.edit") ?? "Edit Therapist"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.name") ?? "Name"}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.city") ?? "City"}</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.specialty") ?? "Specialty"}</label>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.phone") ?? "Phone"}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.email") ?? "Email"}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-light uppercase">{t("admin_dashboard.status") ?? "Status"}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AdminTherapistData["status"])}
              className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="Verified">Verified</option>
              <option value="Under review">Under review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer">
              {t("common.cancel") ?? "Cancel"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="chip !bg-secondary !text-white cursor-pointer disabled:opacity-50"
            >
              {saving ? t("common.loading") : (t("common.save") ?? "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
