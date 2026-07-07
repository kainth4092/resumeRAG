import CardSkeleton from "./CardSkeleton";
import ChartSkeleton from "./ChartSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Welcome Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="space-y-2">
            {/* Greeting */}
            <div className="h-7 bg-muted shimmer rounded-lg w-56" />
            {/* Subtitle */}
            <div className="h-4 bg-muted shimmer rounded-lg w-72" />
          </div>
          {/* Refresh Action button */}
          <div className="h-10 bg-muted shimmer rounded-xl w-32 shrink-0" />
        </div>

        {/* First Row: ATS Trend Chart + Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ATS Trend */}
          <div className="lg:col-span-2">
            <ChartSkeleton height="200px" />
          </div>
          {/* Radar Chart */}
          <div className="lg:col-span-1">
            <CardSkeleton className="h-full min-h-[300px] flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="h-4 bg-muted shimmer rounded-lg w-28" />
                <div className="h-3 bg-muted shimmer rounded-lg w-36" />
              </div>
              {/* Radar mock center */}
              <div className="w-32 h-32 rounded-full border-4 border-muted/80 border-dashed animate-spin [animation-duration:15s] mx-auto flex items-center justify-center my-4">
                <div className="w-20 h-20 rounded-full border-4 border-muted/50 border-dashed" />
              </div>
              <div className="flex justify-around pt-2">
                <div className="h-3 bg-muted shimmer rounded w-12" />
                <div className="h-3 bg-muted shimmer rounded w-12" />
                <div className="h-3 bg-muted shimmer rounded w-12" />
              </div>
            </CardSkeleton>
          </div>
        </div>

        {/* Second Row: Weekly Activity Chart + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly Activity */}
          <div className="lg:col-span-1">
            <ChartSkeleton height="150px" />
          </div>
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <CardSkeleton className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-muted shimmer rounded-lg w-28" />
                <div className="h-3 bg-muted shimmer rounded-lg w-16" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="h-3.5 bg-muted shimmer rounded w-1/3" />
                      <div className="h-2.5 bg-muted shimmer rounded w-3/4" />
                    </div>
                    <div className="h-3 bg-muted shimmer rounded w-12 shrink-0" />
                  </div>
                ))}
              </div>
            </CardSkeleton>
          </div>
        </div>

        {/* Recruiter Simulation Alert Box */}
        <CardSkeleton className="border-amber-500/20 bg-amber-500/[0.02]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted shimmer rounded w-48" />
              <div className="h-3 bg-muted shimmer rounded w-full" />
              <div className="h-3 bg-muted shimmer rounded w-5/6" />
            </div>
          </div>
        </CardSkeleton>
      </div>
    </div>
  );
}
