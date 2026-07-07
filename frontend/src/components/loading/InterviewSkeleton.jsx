import CardSkeleton from "./CardSkeleton";

export default function InterviewSkeleton({ mode = "list" }) {
  if (mode === "challenge") {
    // Active mock interview session / recording page
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="space-y-1.5">
            <div className="h-6 bg-muted shimmer rounded w-48" />
            <div className="h-3 bg-muted shimmer rounded w-32" />
          </div>
          <div className="h-8 bg-muted shimmer rounded-xl w-24" />
        </div>

        <CardSkeleton className="p-8 space-y-6">
          {/* Question Text */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-muted shimmer rounded w-24" />
              <div className="w-4 h-4 rounded-full bg-muted shimmer" />
            </div>
            <div className="h-5 bg-muted shimmer rounded w-full" />
            <div className="h-5 bg-muted shimmer rounded w-[85%]" />
          </div>

          {/* Recording & Audio placeholder */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 border border-dashed border-border/80">
            <div className="w-16 h-16 rounded-full bg-muted shimmer" />
            <div className="space-y-1 text-center">
              <div className="h-4.5 bg-muted shimmer rounded w-32 mx-auto" />
              <div className="h-3 bg-muted shimmer rounded w-48 mx-auto" />
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-between pt-4 border-t border-border/40">
            <div className="h-10 bg-muted shimmer rounded-xl w-28" />
            <div className="h-10 bg-muted shimmer rounded-xl w-24" />
          </div>
        </CardSkeleton>
      </div>
    );
  }

  // Interview Question Bank List mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 bg-muted shimmer rounded-lg w-48" />
          <div className="h-4 bg-muted shimmer rounded-lg w-64" />
        </div>
        <div className="h-10 bg-muted shimmer rounded-xl w-40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filters */}
        <div className="lg:col-span-1 space-y-4">
          <CardSkeleton>
            <div className="space-y-4">
              <div className="h-4.5 bg-muted shimmer rounded w-28" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-muted shimmer" />
                    <div className="h-3.5 bg-muted shimmer rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          </CardSkeleton>
        </div>

        {/* Right Column: Questions Grid */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-5 bg-muted shimmer rounded-full w-16" />
                    <span className="h-5 bg-muted shimmer rounded-full w-12" />
                  </div>
                  <div className="h-4.5 bg-muted shimmer rounded w-[92%]" />
                  <div className="h-3 bg-muted shimmer rounded w-full" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted shimmer shrink-0" />
              </div>
            </CardSkeleton>
          ))}
        </div>
      </div>
    </div>
  );
}
