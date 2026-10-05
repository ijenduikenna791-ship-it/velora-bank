import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>

      {/* Rows */}
      <SkeletonCard className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </SkeletonCard>
    </div>
  );
}
