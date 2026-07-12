"use client";

import { useState, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface UseTableSortOptions {
  defaultColumn?: string;
  defaultDirection?: SortDirection;
}

export interface UseTableSortReturn {
  sort: SortState;
  toggleSort: (column: string) => void;
  sortBy: string;
  sortOrder: SortDirection;
}

export function useTableSort({
  defaultColumn = "name",
  defaultDirection = "asc",
}: UseTableSortOptions = {}): UseTableSortReturn {
  const [sort, setSort] = useState<SortState>({
    column: defaultColumn,
    direction: defaultDirection,
  });

  const toggleSort = useCallback((column: string) => {
    setSort((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    sort,
    toggleSort,
    sortBy: sort.column,
    sortOrder: sort.direction,
  };
}
