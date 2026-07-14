"use client";

import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableHeader } from "./SortableHeader";
import { EmptyTableRow } from "@/components/dashboard/EmptyTableRow";
import { useLang } from "@/context/i18n";
import type { SortDirection } from "@/hooks/useTableSort";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  isLoading?: boolean;
  sortColumn: string;
  sortOrder: SortDirection;
  onSortToggle: (column: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  renderActions?: (row: T) => ReactNode;
  emptyMessage?: string;
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  total,
  isLoading,
  sortColumn,
  sortOrder,
  onSortToggle,
  page,
  pageSize,
  onPageChange,
  renderActions,
  emptyMessage,
  rowClassName,
}: DataTableProps<T>) {
  const { t } = useLang();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[0.65rem] uppercase font-mono text-text-light text-left border-b border-border">
              {columns.map((col) => (
                <SortableHeader
                  key={col.key}
                  label={col.label}
                  column={col.key}
                  activeColumn={sortColumn}
                  direction={sortOrder}
                  onToggle={onSortToggle}
                  className={col.className}
                />
              ))}
              {renderActions && (
                <th className="py-2 text-[0.65rem] uppercase font-mono text-text-light text-right">
                  {t("admin_dashboard.actions") ?? "Actions"}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <EmptyTableRow colSpan={columns.length + (renderActions ? 1 : 0)} message={emptyMessage ?? (t("common.noResults") ?? "No results found")} />
            ) : (
              data.map((row) => (
                <tr key={row.id} className={`hover:bg-muted/30 transition-colors ${rowClassName?.(row) ?? ""}`}>
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 pr-3 ${col.className ?? ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="py-3 text-right">{renderActions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) onPageChange(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === page}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageNum);
                      }}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={totalPages === page}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(totalPages);
                      }}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) onPageChange(page + 1);
                  }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
