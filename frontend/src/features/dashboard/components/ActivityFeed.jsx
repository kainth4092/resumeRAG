import { Zap } from "lucide-react";
import Skeleton from "./Skeleton";

export default function ActivityFeed({ loading, activities }) {
  const feed = activities || [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time status updates
        </p>
      </div>

      <div className="space-y-3.5 my-4 flex-1 overflow-y-auto max-h-[220px] pr-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2 w-36" />
              </div>
            </div>
          ))
        ) : feed.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <p className="text-xs text-muted-foreground">No recent activity.</p>
          </div>
        ) : (
          feed.map((act, i) => {
            const Icon = act.icon || Zap;
            return (
              <div key={i} className="flex gap-3 items-start group">
                <div
                  className={`w-8 h-8 rounded-xl ${act.color || "bg-primary/10 text-primary"} flex items-center justify-center shrink-0`}
                >
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      {act.title}
                    </p>
                    <span className="text-[9px] text-muted-foreground font-semibold uppercase whitespace-nowrap shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {act.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
