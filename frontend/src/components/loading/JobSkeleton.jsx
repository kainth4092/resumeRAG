import CardSkeleton from "./CardSkeleton";

export default function JobSkeleton({ mode = "discovery" }) {
  if (mode === "tracker") {
    // Kanban board layout
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="h-7 bg-muted shimmer rounded-lg w-40" />
            <div className="h-4 bg-muted shimmer rounded-lg w-64" />
          </div>
          <div className="h-10 bg-muted shimmer rounded-xl w-36" />
        </div>

        <div className="flex gap-4 overflow-x-auto flex-1 pb-4 min-h-[500px]">
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c} className="w-72 bg-muted/20 border border-border/60 rounded-2xl p-4 shrink-0 flex flex-col space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-muted shimmer rounded w-20" />
                  <div className="w-5 h-5 rounded-full bg-muted shimmer" />
                </div>
                <div className="w-6 h-6 rounded bg-muted shimmer" />
              </div>

              {/* Kanban cards */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {Array.from({ length: c % 2 === 0 ? 3 : 2 }).map((_, k) => (
                  <div key={k} className="bg-card border border-border rounded-xl p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-muted shimmer" />
                      <div className="h-3 bg-muted shimmer rounded w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3.5 bg-muted shimmer rounded w-full" />
                      <div className="h-3 bg-muted shimmer rounded w-2/3" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border/40">
                      <div className="w-6 h-6 rounded-full bg-muted shimmer" />
                      <div className="h-2.5 bg-muted shimmer rounded w-14" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Job discovery mode (Job list / card grid)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 bg-muted shimmer rounded-lg w-44" />
          <div className="h-4 bg-muted shimmer rounded-lg w-64" />
        </div>
        <div className="h-10 bg-muted shimmer rounded-xl w-48" />
      </div>

      {/* Search/Filter bar placeholder */}
      <div className="h-12 bg-card border border-border rounded-2xl w-full flex items-center px-4 gap-4">
        <div className="w-5 h-5 bg-muted shimmer rounded-full" />
        <div className="h-4 bg-muted shimmer rounded w-1/3" />
        <div className="flex-1" />
        <div className="h-8 bg-muted shimmer rounded-xl w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="flex flex-col justify-between h-56">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted shimmer shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4.5 bg-muted shimmer rounded w-3/4" />
                  <div className="h-3 bg-muted shimmer rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <div className="h-6 bg-muted shimmer rounded-full w-16" />
                <div className="h-6 bg-muted shimmer rounded-full w-20" />
                <div className="h-6 bg-muted shimmer rounded-full w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <div className="h-3.5 bg-muted shimmer rounded w-24" />
              <div className="h-8 bg-muted shimmer rounded-xl w-20" />
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  );
}
