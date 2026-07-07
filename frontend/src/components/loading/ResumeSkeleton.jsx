import CardSkeleton from "./CardSkeleton";

export default function ResumeSkeleton({ mode = "list" }) {
  if (mode === "builder") {
    return (
      <div className="h-screen flex overflow-hidden bg-background">
        {/* Editor Form Panel (Left) */}
        <div className="w-1/2 border-r border-border h-full flex flex-col p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="h-6 bg-muted shimmer rounded w-48" />
            <div className="flex gap-2">
              <div className="h-9 bg-muted shimmer rounded-xl w-24" />
              <div className="h-9 bg-muted shimmer rounded-xl w-24" />
            </div>
          </div>

          {/* Section accordion placeholders */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-muted shimmer" />
                  <div className="h-4 bg-muted shimmer rounded w-32" />
                </div>
                <div className="w-5 h-5 rounded-full bg-muted shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Panel (Right) */}
        <div className="w-1/2 bg-slate-100 dark:bg-slate-950 p-8 h-full overflow-y-auto flex justify-center">
          <div className="w-[85%] bg-white dark:bg-slate-900 border border-border shadow-md rounded-xl p-12 min-h-[842px] space-y-8 self-start">
            {/* Header info */}
            <div className="text-center space-y-3 pb-6 border-b border-border/40">
              <div className="h-7 bg-muted shimmer rounded w-48 mx-auto" />
              <div className="h-3 bg-muted shimmer rounded w-72 mx-auto" />
              <div className="h-3.5 bg-muted shimmer rounded w-96 mx-auto" />
            </div>

            {/* Resume sections */}
            {Array.from({ length: 3 }).map((_, s) => (
              <div key={s} className="space-y-3">
                <div className="h-4 bg-muted shimmer rounded w-28" />
                <div className="border-b border-border w-full pb-1" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 bg-muted shimmer rounded w-44" />
                    <div className="h-3 bg-muted shimmer rounded w-20" />
                  </div>
                  <div className="h-3 bg-muted shimmer rounded w-32" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 bg-muted shimmer rounded w-full" />
                    <div className="h-2.5 bg-muted shimmer rounded w-[96%]" />
                    <div className="h-2.5 bg-muted shimmer rounded w-[90%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Resume list mode (MyResumes page)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 bg-muted shimmer rounded-lg w-36" />
          <div className="h-4 bg-muted shimmer rounded-lg w-64" />
        </div>
        <div className="h-10 bg-muted shimmer rounded-xl w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="h-64 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-muted shimmer" />
                <div className="w-8 h-8 rounded-full bg-muted shimmer" />
              </div>
              <div className="h-4.5 bg-muted shimmer rounded w-3/4" />
              <div className="h-3 bg-muted shimmer rounded w-1/2" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="h-3.5 bg-muted shimmer rounded w-20" />
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded bg-muted shimmer" />
                <div className="w-7 h-7 rounded bg-muted shimmer" />
              </div>
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  );
}
