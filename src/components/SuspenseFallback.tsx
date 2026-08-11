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

export function TherapistCardSkeleton() {
  return (
    <div className="card-soft p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-border shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-3/4 bg-border rounded" />
          <div className="h-3 w-1/2 bg-border rounded" />
          <div className="h-3 w-16 bg-border rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="h-5 w-20 bg-border rounded" />
        <div className="h-8 w-24 bg-border rounded" />
      </div>
    </div>
  );
}

export function TherapistCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TherapistCardSkeleton key={i} />
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

export function TherapistProfileSkeleton() {
  const block = "bg-surface border-2 border-carbon rounded-xl animate-pulse";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Hero card skeleton */}
        <div className="card-neo overflow-hidden md:flex md:items-stretch">
          <div className="md:w-2/5 relative bg-volt border-b-2 md:border-b-0 md:border-r-2 border-carbon min-h-[280px] md:min-h-0 grid place-items-center">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl border-2 border-carbon bg-mint/70 animate-pulse" />
            <div className="absolute bottom-4 left-4 h-6 w-28 bg-surface/70 border-2 border-carbon rounded-full animate-pulse" />
          </div>
          <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className={`${block} h-7 w-28 rounded-full`} />
                <div className={`${block} h-7 w-20 rounded-full`} />
              </div>
              <div className={`${block} h-9 md:h-10 w-3/4 !rounded-lg`} />
              <div className={`${block} h-4 w-44`} />
              <div className="h-0.5 w-full bg-carbon border border-carbon rounded animate-pulse" />
              <div className="space-y-2 pt-1">
                <div className={`${block} h-3.5 w-full`} />
                <div className={`${block} h-3.5 w-11/12`} />
                <div className={`${block} h-3.5 w-4/5`} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <div className={`${block} h-9 w-14`} />
                <div className={`${block} h-3 w-20`} />
              </div>
              <div className="h-14 border-2 border-carbon" />
              <div className="space-y-1">
                <div className={`${block} h-9 w-12`} />
                <div className={`${block} h-3 w-24`} />
              </div>
            </div>
          </div>
        </div>

        {/* Bento cards skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="card-neo p-6 animate-pulse">
              <div className="flex items-center gap-3 border-b-2 border-carbon pb-4 mb-6">
                <div className="w-8 h-8 bg-surface border-2 border-carbon rounded" />
                <div className="h-6 w-32 bg-surface border-2 border-carbon rounded" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 mt-1 bg-surface border-2 border-carbon shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 bg-surface border-2 border-carbon rounded" />
                    <div className="h-3 w-1/2 bg-surface border-2 border-carbon rounded" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 mt-1 bg-surface border-2 border-carbon shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-surface border-2 border-carbon rounded" />
                    <div className="h-3 w-1/3 bg-surface border-2 border-carbon rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking widget skeleton */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
        <div className="card-neo p-6 flex flex-col gap-6 animate-pulse">
          <div className="border-b-2 border-carbon pb-4 flex justify-between items-end">
            <div className="h-6 w-32 bg-surface border-2 border-carbon rounded" />
            <div className="h-6 w-16 bg-volt border-2 border-carbon rounded" />
          </div>

          <div className="h-11 bg-surface border-2 border-carbon rounded" />

          <div>
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-2.5 mx-auto w-6 bg-surface border border-carbon rounded" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-surface border-2 border-carbon rounded" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 bg-surface border border-carbon rounded" />
              <div className="h-3 w-24 bg-surface border border-carbon rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface border-2 border-carbon rounded-xl" />
              ))}
            </div>
          </div>

          <div className="h-12 w-full bg-carbon border-2 border-carbon rounded" />
          <div className="h-3 w-2/3 mx-auto bg-surface border border-carbon rounded" />
        </div>
      </div>
    </div>
  );
}
