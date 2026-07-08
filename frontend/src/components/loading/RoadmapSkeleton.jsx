import CardSkeleton from "./CardSkeleton";

export default function RoadmapSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-background animate-pulse">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header Skeleton */}
        <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-border/50">
          <div className="space-y-2">
            <div className="h-8 bg-muted shimmer rounded-lg w-48" />
            <div className="h-4 bg-muted shimmer rounded-lg w-96 max-w-full" />
          </div>
          <div className="h-10 bg-muted shimmer rounded-xl w-40 shrink-0" />
        </div>

        {/* TargetRoleBanner Skeleton */}
        <div className="bg-muted/10 border border-border/50 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-muted shimmer shrink-0" />
            <div className="space-y-2">
              <div className="h-4 bg-muted shimmer rounded w-32" />
              <div className="h-3 bg-muted shimmer rounded w-20" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto min-w-[200px] sm:min-w-[240px]">
            <div className="h-3 bg-muted shimmer rounded w-16" />
            <div className="flex-1 h-2 bg-muted shimmer rounded-full" />
            <div className="h-3 bg-muted shimmer rounded w-8" />
          </div>
        </div>

        {/* SkillGapAnalysis Skeleton (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Current Skills */}
          <CardSkeleton>
            <div className="h-4 bg-muted shimmer rounded w-28 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3.5 bg-muted shimmer rounded w-28 shrink-0" />
                  <div className="flex-1 h-2 bg-muted shimmer rounded-full" />
                  <div className="h-3 bg-muted shimmer rounded w-8 shrink-0" />
                </div>
              ))}
            </div>
          </CardSkeleton>
          {/* Card 2: Required Skills */}
          <CardSkeleton>
            <div className="h-4 bg-muted shimmer rounded w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3.5 bg-muted shimmer rounded w-28 shrink-0" />
                  <div className="flex-1 h-2 bg-muted shimmer rounded-full" />
                  <div className="h-3 bg-muted shimmer rounded w-8 shrink-0" />
                  <div className="h-5 bg-muted shimmer rounded-full w-12 shrink-0" />
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

        {/* TimelineRoadmap Skeleton (30-60-90 days - 3 cols) */}
        <CardSkeleton>
          <div className="h-4 bg-muted shimmer rounded w-40 mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, colIdx) => (
              <div key={colIdx} className="border border-border/50 rounded-xl p-4 space-y-4 bg-muted/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-muted shimmer rounded w-16" />
                  <div className="h-3 bg-muted shimmer rounded w-20" />
                </div>
                <div className="w-full h-1.5 bg-muted shimmer rounded-full mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-muted shimmer shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted shimmer rounded w-full" />
                        {itemIdx % 2 === 0 && <div className="h-3 bg-muted shimmer rounded w-3/4" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardSkeleton>

        {/* Recommendations and Projects Skeleton (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Recommendations */}
          <CardSkeleton>
            <div className="h-4 bg-muted shimmer rounded w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-border/30 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-muted shimmer shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 bg-muted shimmer rounded w-3/4" />
                    <div className="h-3 bg-muted shimmer rounded w-1/2" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="h-4 bg-muted shimmer rounded-full w-12" />
                    <div className="w-3.5 h-3.5 bg-muted shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardSkeleton>

          {/* Card 2: Projects */}
          <CardSkeleton>
            <div className="h-4 bg-muted shimmer rounded w-36 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border border-border/50 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-4 bg-muted shimmer rounded w-1/2" />
                    <div className="h-4 bg-muted shimmer rounded-full w-12" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from({ length: 3 }).map((_, skillIdx) => (
                      <div key={skillIdx} className="h-5 bg-muted shimmer rounded-full w-16" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

      </div>
    </div>
  );
}
