"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useLang } from "@/context/i18n";
import { toast } from "sonner";
import {
  Search,
  X,
  Pencil,
  Filter,
  Calendar,
  ChevronDown,
  Save,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  phone: string;
  condition: string;
  sessions: number;
  last: string;
  notes: string;
}

const PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Ramesh Adhikari",
    phone: "9841001001",
    condition: "Post-surgery",
    sessions: 8,
    last: "2026-06-20",
    notes: "Recovering well, continue exercises.",
  },
  {
    id: "p2",
    name: "Sita Lama",
    phone: "9841002002",
    condition: "Back Pain",
    sessions: 4,
    last: "2026-06-22",
    notes: "Needs posture correction.",
  },
  {
    id: "p3",
    name: "Hari Pradhan",
    phone: "9841003003",
    condition: "Sports Injury",
    sessions: 12,
    last: "2026-06-18",
    notes: "Knee ligament rehab, progressing.",
  },
  {
    id: "p4",
    name: "Anita Sharma",
    phone: "9841004004",
    condition: "Back Pain",
    sessions: 3,
    last: "2026-06-15",
    notes: "Initial assessment done.",
  },
];

const CONDITION_OPTIONS = ["Post-surgery", "Back Pain", "Sports Injury", "Post-stroke rehab", "Frozen shoulder"];

const LAST_VISIT_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 3 months", value: "90" },
] as const;

export default function Patients() {
  const { t } = useLang();
  const [selected, setSelected] = useState<Patient | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<Patient | null>(null);

  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [lastVisitFilter, setLastVisitFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...PATIENTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    if (conditionFilter) {
      list = list.filter((p) => p.condition === conditionFilter);
    }

    if (lastVisitFilter !== "all") {
      const days = parseInt(lastVisitFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      list = list.filter((p) => p.last >= cutoffStr);
    }

    return list;
  }, [search, conditionFilter, lastVisitFilter]);

  const hasFilters = search.trim() !== "" || conditionFilter !== "" || lastVisitFilter !== "all";

  function clearFilters() {
    setSearch("");
    setConditionFilter("");
    setLastVisitFilter("all");
  }

  function openEdit(p: Patient) {
    setEditing(p);
    setEditForm({ ...p });
  }

  function saveEdit() {
    if (!editForm) return;
    const idx = PATIENTS.findIndex((p) => p.id === editForm.id);
    if (idx !== -1) {
      PATIENTS[idx] = { ...editForm };
    }
    setEditing(null);
    setEditForm(null);
    toast.success("Patient details updated!");
  }

  return (
    <>
      {/* ─── Search & Filters ─── */}
      <div className="card-soft p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Search by name, phone, or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Conditions</option>
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={lastVisitFilter}
              onChange={(e) => setLastVisitFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {LAST_VISIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
            <span className="text-[11px] text-text-light">
              {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        )}
      </div>

      {/* ─── Patient Table ─── */}
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left bg-surface/60 text-xs uppercase tracking-wider font-mono text-text-light">
            <tr>
              <th className="p-3">{t("therapist_dashboard.patientLabel")}</th>
              <th className="p-3">{t("therapist_dashboard.condition")}</th>
              <th className="p-3">{t("therapist_dashboard.sessions")}</th>
              <th className="p-3">{t("therapist_dashboard.lastVisit")}</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-surface/40 cursor-pointer"
                onClick={() => setSelected(p)}
              >
                <td className="p-3 flex items-center gap-2">
                  <Avatar name={p.name} size={32} />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-3 text-text-light">{p.condition}</td>
                <td className="p-3">{p.sessions}</td>
                <td className="p-3 text-text-light">{p.last}</td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(p);
                    }}
                    className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-primary transition-colors"
                    title="Edit patient"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-text-light text-sm"
                >
                  No patients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Patient Detail Drawer ─── */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end p-0 sm:p-6">
          <button
            className="absolute inset-0 bg-text/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={selected.name} size={52} />
              <div>
                <div className="font-display text-xl">{selected.name}</div>
                <div className="text-xs text-text-light">
                  {selected.condition}
                </div>
              </div>
            </div>
            <Row
              label={t("therapist_dashboard.totalSessions")}
              value={String(selected.sessions)}
            />
            <Row label={t("therapist_dashboard.lastVisit")} value={selected.last} />
            <Row label="Phone" value={selected.phone} />
            <Row label="Notes" value={selected.notes || "—"} />
            <button
              onClick={() => setSelected(null)}
              className="btn-outline w-full mt-5"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* ─── Edit Patient Modal ─── */}
      {editing && editForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <button
            className="absolute inset-0 bg-text/50"
            onClick={() => setEditing(null)}
          />
          <div className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl border border-border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold">
                Edit Patient Details
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg hover:bg-surface text-text-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <EditField
                label="Patient Name"
                value={editForm.name}
                onChange={(v) => setEditForm({ ...editForm, name: v })}
              />
              <EditField
                label="Phone Number"
                value={editForm.phone}
                onChange={(v) => setEditForm({ ...editForm, phone: v })}
              />
              <div>
                <label className="text-xs font-medium text-text-light">
                  Condition
                </label>
                <select
                  value={editForm.condition}
                  onChange={(e) =>
                    setEditForm({ ...editForm, condition: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <EditField
                label="Sessions"
                type="number"
                value={String(editForm.sessions)}
                onChange={(v) =>
                  setEditForm({ ...editForm, sessions: +v })
                }
              />
              <EditField
                label="Last Visit (YYYY-MM-DD)"
                value={editForm.last}
                onChange={(v) => setEditForm({ ...editForm, last: v })}
              />
              <div>
                <label className="text-xs font-medium text-text-light">
                  Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border text-sm">
      <span className="text-text-light">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-text-light">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />
    </div>
  );
}
