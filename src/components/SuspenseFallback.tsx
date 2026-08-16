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
    <section className="my-6  card-soft p-5 bg-surface/40 animate-pulse">
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

export function TherapistCardSkeleton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <div className={`${dark ? "card-glass" : "card-soft"} p-4 flex flex-col gap-3 animate-pulse`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-full ${dark ? "bg-white/15" : "bg-border"} shrink-0`} />
        <div className="flex-1 min-w-0 space-y-2">
          <div className={`h-4 w-3/4 ${dark ? "bg-white/15" : "bg-border"} rounded`} />
          <div className={`h-3 w-1/2 ${dark ? "bg-white/15" : "bg-border"} rounded`} />
          <div className={`h-3 w-16 ${dark ? "bg-white/15" : "bg-border"} rounded`} />
        </div>
      </div>
      <div className={`flex items-center justify-between pt-2 border-t ${dark ? "border-white/10" : "border-border"}`}>
        <div className={`h-5 w-20 ${dark ? "bg-white/15" : "bg-border"} rounded`} />
        <div className={`h-8 w-24 ${dark ? "bg-white/15" : "bg-border"} rounded`} />
      </div>
    </div>
  );
}

export function TherapistCardGridSkeleton({ count = 6, variant = "light" }: { count?: number; variant?: "light" | "dark" }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TherapistCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function HeroLiveSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="w-[42px] h-[42px] rounded-full bg-white/15 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3.5 w-2/3 bg-white/15 rounded" />
            <div className="h-3 w-1/3 bg-white/15 rounded" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-4 w-12 bg-white/15 rounded ml-auto" />
            <div className="h-7 w-16 bg-white/15 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedTherapistsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl overflow-hidden p-6 h-72 flex flex-col justify-between border border-white/10 bg-white/5 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-4 w-14 bg-white/15 rounded" />
            <div className="h-4 w-10 bg-white/15 rounded" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-2/3 bg-white/15 rounded" />
            <div className="h-4 w-1/2 bg-white/15 rounded" />
            <div className="h-8 w-24 bg-white/15 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
