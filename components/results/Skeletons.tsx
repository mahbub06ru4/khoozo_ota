export function ResultCardSkeleton() {
  return (
    <div className="card p-5" aria-hidden>
      <div className="flex items-center gap-4">
        <div className="skeleton size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-1/4" />
        </div>
        <div className="hidden w-32 space-y-2 sm:block">
          <div className="skeleton ml-auto h-5 w-24" />
          <div className="skeleton ml-auto h-9 w-28 rounded-xl" />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-1.5 flex-1 rounded-full" />
        <div className="skeleton h-8 w-16" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">Loading results…</span>
      {Array.from({ length: count }, (_, i) => (
        <ResultCardSkeleton key={i} />
      ))}
    </div>
  );
}
