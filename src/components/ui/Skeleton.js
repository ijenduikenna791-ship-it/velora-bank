/**
 * Shimmering placeholder block. Compose these to mirror a page's real layout
 * so the dashboard feels instant while server data loads.
 */
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-line/60 ${className}`} />;
}

export function SkeletonCard({ className = "", children }) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
}
