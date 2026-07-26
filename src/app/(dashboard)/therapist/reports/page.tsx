"use client";

import { UploadReport } from "../components/UploadReport";
import { RecentlyUploaded } from "../components/RecentlyUploaded";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/SuspenseFallback";

export default function ReportsUpload() {
  function RecentlySectionWithPagination() {
   return( <ErrorBoundary>
      <Suspense fallback={<CardSkeleton />}>
        <RecentlyUploaded paginated/>
      </Suspense>
    </ErrorBoundary>
   )
  }

  return (
    <div className="grid gap-4">
      <UploadReport />
      <RecentlySectionWithPagination />
    </div>
  );
}
