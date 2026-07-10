import type { ViewMode } from "./ViewToggle";

interface SessionSkeletonProps {
  view: ViewMode;
}

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border ${className ?? ""}`} />;
}

export function SessionSkeleton({ view }: SessionSkeletonProps) {
  if (view === "grid") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-soft p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Pulse className="w-11 h-11 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-20" />
              </div>
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
            <Pulse className="h-3 w-40" />
            <div className="flex justify-between pt-2 border-t border-border">
              <Pulse className="h-4 w-16" />
              <Pulse className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Pulse className="h-8 flex-1 rounded-xl" />
              <Pulse className="h-8 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "compact") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Pulse className="h-4 w-28" />
            <Pulse className="h-4 w-32" />
            <Pulse className="h-4 w-16" />
            <Pulse className="h-4 w-14" />
            <Pulse className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-soft p-4 flex items-center gap-4">
          <Pulse className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-4 w-36" />
            <Pulse className="h-3 w-56" />
          </div>
          <Pulse className="h-5 w-20 rounded-full shrink-0" />
          <div className="flex gap-2 shrink-0">
            <Pulse className="h-8 w-20 rounded-xl" />
            <Pulse className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
