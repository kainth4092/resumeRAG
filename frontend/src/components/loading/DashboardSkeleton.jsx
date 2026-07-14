import {
  Skeleton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonText,
} from "../common/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <SkeletonText width="w-80 max-w-full" />
        </div>

        <Skeleton className="h-11 w-36" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} className="min-h-[145px]">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <SkeletonText width="w-28" />
                <Skeleton className="h-8 w-20" />
              </div>

              <Skeleton className="h-11 w-11" />
            </div>

            <SkeletonText width="w-36" className="mt-5" />
          </SkeletonCard>
        ))}
      </div>

      {/* Main dashboard */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SkeletonCard className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>

          <Skeleton className="mt-6 h-[270px] w-full" />
        </SkeletonCard>

        <SkeletonCard>
          <Skeleton className="h-5 w-36" />

          <div className="mt-6 space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonCircle />

                <div className="flex-1 space-y-2">
                  <SkeletonText />
                  <SkeletonText width="w-2/3" height="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <SkeletonCard key={item}>
            <Skeleton className="h-5 w-40" />

            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="
                      flex items-center gap-4
                      rounded-xl
                      border border-border
                      p-3
                    "
                >
                  <Skeleton className="h-10 w-10" />

                  <div className="flex-1 space-y-2">
                    <SkeletonText />
                    <SkeletonText width="w-1/2" height="h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
