export function StatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-soft p-5 animate-pulse">
          <div className="h-3 w-20 bg-border rounded mb-3" />
          <div className="h-7 w-16 bg-border rounded" />
          <div className="h-3 w-24 bg-border rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <section className="mt-6 card-soft p-5 bg-surface/40 animate-pulse">
      <div className="h-4 w-24 bg-border rounded mb-3" />
      <div className="h-5 w-48 bg-border rounded mb-2" />
      <div className="h-4 w-64 bg-border rounded mb-4" />
      <div className="h-10 w-40 bg-border rounded" />
    </section>
  );
}

export function WelcomeSkeleton() {
  return (
    <div className="mb-6 animate-pulse">
      <div className="h-8 w-64 bg-border rounded mb-2" />
      <div className="h-4 w-48 bg-border rounded" />
    </div>
  );
}

export function AppointmentsSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="h-6 w-40 bg-border rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card-soft p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-border shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-border rounded" />
              <div className="h-3 w-24 bg-border rounded" />
            </div>
            <div className="h-8 w-20 bg-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div>
      <WelcomeSkeleton />
      <StatsSkeleton />
      <AppointmentsSkeleton />
      <CardSkeleton />
    </div>
  );
}
