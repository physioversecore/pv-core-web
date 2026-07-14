"use client";

import { UploadReport } from "../components/UploadReport";
import { RecentlyUploaded } from "../components/RecentlyUploaded";

export default function ReportsUpload() {
  return (
    <div className="grid gap-4">
      <UploadReport />
      <RecentlyUploaded paginated />
    </div>
  );
}
