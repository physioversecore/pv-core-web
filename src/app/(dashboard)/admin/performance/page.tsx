"use client";

import { useState, useMemo, useCallback } from "react";
import { Star, TrendingUp, TrendingDown, Minus, Download, Calendar, Shield } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSort } from "@/hooks/useTableSort";
import { useAdminPerformance } from "@/hooks/useAdminPerformance";
import { DashboardStat } from "@/components/dashboard/DashboardStat";
import {
  DataTable,
  FilterBar,
  StatusChip,
  type Column,
  type FilterConfig,
} from "@/components/tables";
import type { AdminPerformanceData } from "@/services/api/admin";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export default function PerformancePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<AdminPerformanceData | null>(null);

  const debouncedSearch = useDebounce(search);
  const { sort, toggleSort, sortBy, sortOrder } = useTableSort({ defaultColumn: "name" });
  const pageSize = 10;

  const { items, total, isLoading } = useAdminPerformance({
    search: debouncedSearch,
    status,
    minRating,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

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
    (row: AdminPerformanceData) => (
      <div className="flex items-center justify-end gap-1">
        {row.status === "Good standing" ? (
          <button
            className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
            title="View history"
          >
            <Shield size={15} />
          </button>
        ) : row.status === "Needs review" ? (
          <>
            <button
              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
              title="Schedule review"
            >
              <Calendar size={15} />
            </button>
            <button
              className="chip !bg-info/15 !text-info cursor-pointer !text-[0.6rem]"
              title="Probation"
            >
              Probation
            </button>
          </>
        ) : row.status === "Under probation" ? (
          <>
            <button
              className="p-1.5 rounded-lg hover:bg-surface text-text-light hover:text-secondary transition cursor-pointer"
              title="View history"
            >
              <Shield size={15} />
            </button>
            <button
              className="chip !bg-destructive/10 !text-destructive cursor-pointer !text-[0.6rem]"
              title="Remove from team"
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
    ),
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
    </div>
  );
}

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
