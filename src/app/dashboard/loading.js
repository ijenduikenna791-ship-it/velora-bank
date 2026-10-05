import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Balance card */}
          <SkeletonCard>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-10 w-56" />
            <Skeleton className="mt-3 h-4 w-40" />
          </SkeletonCard>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>

          {/* Activity chart */}
          <SkeletonCard>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-28 w-full" />
          </SkeletonCard>
        </div>

        {/* Recent activity */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <SkeletonCard className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </SkeletonCard>
        </div>
      </div>

      {/* Accounts */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mt-5 h-11 w-full" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
