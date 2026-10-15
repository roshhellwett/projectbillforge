export function WelcomeBannerSkeleton() {
  return (
    <div className="glass-card flex min-h-56 items-center justify-between p-6 sm:p-8 md:p-10" aria-hidden="true">
      <div className="relative z-10 w-full max-w-xl">
        <div className="skeleton mb-4 h-5 w-36 rounded-full" />
        <div className="skeleton mb-3 h-9 w-3/4 rounded-lg" />
        <div className="skeleton mb-6 h-4 w-1/2 rounded-lg" />
        <div className="skeleton h-11 w-36 rounded-xl" />
      </div>
      <div className="skeleton hidden h-32 w-32 rounded-3xl md:block" />
    </div>
  );
}

export function AttentionSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 lg:p-7" aria-hidden="true">
      <div className="skeleton h-6 w-52 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-72 max-w-full rounded-lg" />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton min-h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 lg:p-7" aria-hidden="true">
      <div className="skeleton h-6 w-36 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-64 max-w-full rounded-lg" />
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton min-h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function OverviewCardsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-3xl sm:h-40" />
        ))}
      </div>
    </div>
  );
}

export function SalesTrendSkeleton() {
  return (
    <div className="glass-card flex min-h-[300px] h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8" aria-hidden="true">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div>
            <div className="skeleton mb-1 h-4 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="skeleton mb-1 ml-auto h-3 w-16 rounded" />
          <div className="skeleton ml-auto h-6 w-24 rounded" />
        </div>
      </div>
      <div className="skeleton mt-4 min-h-44 flex-1 rounded-xl" />
    </div>
  );
}

export function BusinessSnapshotSkeleton() {
  return (
    <div className="glass-card flex h-full min-h-[300px] flex-col p-5 sm:p-6 md:p-7 lg:p-8" aria-hidden="true">
      <div className="skeleton mb-4 h-5 w-32 rounded" />
      <div className="space-y-3 flex-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function RecentInvoicesSkeleton() {
  return (
    <div className="glass-card flex h-full min-h-[320px] flex-col p-5 sm:p-6 md:p-7 lg:p-8" aria-hidden="true">
      <div className="mb-5 flex items-center gap-3">
        <div className="skeleton h-8 w-8 rounded-xl" />
        <div className="skeleton h-5 w-32 rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div>
                <div className="skeleton mb-1 h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            </div>
            <div className="skeleton h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopReceivablesSkeleton() {
  return (
    <div className="glass-card flex h-full min-h-[320px] flex-col p-5 sm:p-6 md:p-7 lg:p-8" aria-hidden="true">
      <div className="mb-5 flex items-center gap-3">
        <div className="skeleton h-5 w-32 rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div>
                <div className="skeleton mb-1 h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            </div>
            <div className="skeleton h-5 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LowStockSkeleton() {
  return (
    <div className="glass-card p-5 sm:p-6 md:p-7" aria-hidden="true">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="skeleton h-8 w-8 rounded-xl" />
        <div className="skeleton h-5 w-32 rounded" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
