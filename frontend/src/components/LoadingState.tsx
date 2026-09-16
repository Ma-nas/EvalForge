/**
 * LoadingState — Skeleton loaders matching the glass morphism design system.
 * Provides shimmer animation for cards, charts, and tables.
 */

// ─── Skeleton Card ──────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 animate-pulse">
      <div className="w-24 h-24 rounded-full bg-white/5 shimmer" />
      <div className="space-y-2 w-full">
        <div className="h-4 bg-white/5 rounded-lg w-3/4 mx-auto shimmer" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2 mx-auto shimmer" />
      </div>
    </div>
  );
}

// ─── Skeleton Chart ─────────────────────────────────
export function SkeletonChart({ height = 280 }: { height?: number }) {
  return (
    <div className="glass-card p-6">
      <div className="h-5 bg-white/5 rounded-lg w-40 mb-4 shimmer" />
      <div className="flex items-end gap-3 justify-center" style={{ height }}>
        {[65, 85, 45, 70, 55, 90, 60].map((h, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-t-md shimmer"
            style={{ height: `${h}%`, width: 32, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Table ─────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card p-6">
      <div className="h-5 bg-white/5 rounded-lg w-40 mb-4 shimmer" />
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex gap-4 pb-3 border-b border-white/5">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-white/5 rounded flex-1 shimmer" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 py-2" style={{ animationDelay: `${rowIdx * 0.05}s` }}>
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-3 bg-white/5 rounded flex-1 shimmer"
                style={{ animationDelay: `${(rowIdx + colIdx) * 0.05}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton Stat Card ─────────────────────────────
export function SkeletonStatCard() {
  return (
    <div className="glass-card p-6 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-white/5 shimmer" />
      <div className="h-8 bg-white/5 rounded-lg w-20 shimmer" />
      <div className="h-3 bg-white/5 rounded-lg w-28 shimmer" />
    </div>
  );
}

// ─── Full Page Loading ──────────────────────────────
export function PageLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 bg-white/5 rounded-lg w-48 shimmer" />
        <div className="h-4 bg-white/5 rounded-lg w-80 shimmer" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <Icon className="w-16 h-16 text-text-muted mb-4 opacity-30" />
      <h3 className="text-xl font-semibold text-text-secondary">{title}</h3>
      <p className="text-sm text-text-muted mt-2 max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Error State ────────────────────────────────────
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center text-center border-accent-rose/20">
      <div className="w-14 h-14 rounded-2xl bg-accent-rose/10 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-accent-rose">Something went wrong</h3>
      <p className="text-sm text-text-secondary mt-2 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}
