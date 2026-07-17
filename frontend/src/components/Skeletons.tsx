/**
 * Loading skeleton components for better perceived performance.
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card p-4 animate-pulse ${className}`}>
      <div className="h-3 bg-slate-800 rounded w-1/3 mb-3" />
      <div className="h-4 bg-slate-800 rounded w-2/3 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
    </div>
  );
}

export function SkeletonText({ width = "100%", height = 3 }: { width?: string; height?: number }) {
  return (
    <div
      className="bg-slate-800 rounded animate-pulse"
      style={{ width, height: `${height * 4}px` }}
    />
  );
}

export function SkeletonServiceGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card p-4 animate-pulse">
          <div className="h-3 bg-slate-800 rounded w-1/2 mb-2" />
          <div className="h-6 bg-slate-800 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-800 rounded w-1/6" />
          <div className="h-4 bg-slate-800 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
