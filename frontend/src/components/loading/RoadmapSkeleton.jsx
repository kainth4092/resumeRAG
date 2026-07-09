import CardSkeleton from "./CardSkeleton";

const SkeletonBlock = ({ className = "" }) => (
  <div className={`bg-muted shimmer rounded-md ${className}`} />
);

export default function RoadmapSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-44 rounded-lg" />
            <SkeletonBlock className="h-3.5 w-full sm:w-96 max-w-full" />
          </div>

          <SkeletonBlock className="h-10 w-full sm:w-44 rounded-xl shrink-0" />
        </div>

        {/* Target Role Banner */}
        <div className="border border-primary/10 bg-primary/5 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3.5">
            <SkeletonBlock className="w-12 h-12 rounded-xl shrink-0" />

            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto w-full sm:w-auto sm:min-w-[240px]">
            <SkeletonBlock className="h-3 w-16 shrink-0" />
            <SkeletonBlock className="flex-1 h-2 rounded-full" />
            <SkeletonBlock className="h-3 w-8 shrink-0" />
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardSkeleton>
            <SkeletonBlock className="h-4 w-28 mb-5" />

            <div className="space-y-4">
              {[72, 58, 84, 64, 76].map((width, index) => (
                <div key={index} className="flex items-center gap-3">
                  <SkeletonBlock className="h-3.5 w-28 shrink-0" />

                  <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden">
                    <SkeletonBlock
                      className="h-full rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <SkeletonBlock className="h-3 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </CardSkeleton>

          <CardSkeleton>
            <SkeletonBlock className="h-4 w-48 mb-5" />

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <SkeletonBlock className="h-3.5 w-28 shrink-0" />

                  <SkeletonBlock className="flex-1 h-2 rounded-full" />

                  <SkeletonBlock className="h-3 w-8 shrink-0" />

                  <SkeletonBlock className="h-5 w-12 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>

        {/* 30–60–90 Day Roadmap */}
        <CardSkeleton>
          <SkeletonBlock className="h-4 w-40 mb-5" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, periodIndex) => (
              <div
                key={periodIndex}
                className="border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <SkeletonBlock className="h-4 w-16" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>

                <SkeletonBlock className="w-full h-1.5 rounded-full mb-4" />

                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-2.5">
                      <SkeletonBlock className="w-[15px] h-[15px] rounded-full shrink-0 mt-0.5" />

                      <div className="flex-1 space-y-1.5">
                        <SkeletonBlock
                          className={`h-3 ${
                            itemIndex % 3 === 0
                              ? "w-full"
                              : itemIndex % 3 === 1
                                ? "w-5/6"
                                : "w-3/4"
                          }`}
                        />

                        {itemIndex === 0 && (
                          <SkeletonBlock className="h-3 w-2/3" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardSkeleton>

        {/* Learning Recommendations + Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Learning Recommendations */}
          <CardSkeleton>
            <SkeletonBlock className="h-4 w-40 mb-4" />

            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl border border-transparent"
                >
                  <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <SkeletonBlock
                      className={`h-4 ${index % 2 === 0 ? "w-3/4" : "w-2/3"}`}
                    />

                    <SkeletonBlock
                      className={`h-3 ${index % 2 === 0 ? "w-1/2" : "w-2/5"}`}
                    />
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <SkeletonBlock className="h-5 w-12 rounded-full" />
                    <SkeletonBlock className="w-3.5 h-3.5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardSkeleton>

          {/* Projects to Build */}
          <CardSkeleton>
            <SkeletonBlock className="h-4 w-32 mb-4" />

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <SkeletonBlock
                      className={`h-4 ${
                        index === 0 ? "w-1/2" : index === 1 ? "w-2/3" : "w-5/12"
                      }`}
                    />

                    <SkeletonBlock className="h-5 w-12 rounded-full shrink-0" />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: index === 1 ? 4 : 3 }).map(
                      (_, skillIndex) => (
                        <SkeletonBlock
                          key={skillIndex}
                          className={`h-5 rounded-full ${
                            skillIndex % 2 === 0 ? "w-16" : "w-20"
                          }`}
                        />
                      ),
                    )}
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
