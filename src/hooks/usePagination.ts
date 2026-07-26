"use client";

import { useState, useCallback, useMemo } from "react";

interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  skip: number;
  goToPage: (page: number) => void;
  nextPage: (totalItems: number) => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  reset: () => void;
  canPrev: boolean;
  canNext: (totalItems: number) => boolean;
  totalPages: (totalItems: number) => number;
}

export function usePagination({
  pageSize: initialPageSize = 10,
  initialPage = 1,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const skip = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const totalPages = useCallback(
    (totalItems: number) => Math.max(1, Math.ceil(totalItems / pageSize)),
    [pageSize],
  );

  const canPrev = page > 1;

  const canNext = useCallback(
    (totalItems: number) => page < totalPages(totalItems),
    [page, totalPages],
  );

  const goToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, p);
      setPage(clamped);
    },
    [],
  );

  const nextPage = useCallback(
    (totalItems: number) => {
      if (page < totalPages(totalItems)) {
        setPage((p) => p + 1);
      }
    },
    [page, totalPages],
  );

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    skip,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    reset,
    canPrev,
    canNext,
    totalPages,
  };
}
