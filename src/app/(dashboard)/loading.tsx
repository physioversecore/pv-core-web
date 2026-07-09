import { DashboardPageSkeleton } from "@/components/SuspenseFallback";

export default function DashboardLoading() {
  return (
    <div className="p-6">
      <DashboardPageSkeleton />
    </div>
  );
}
