
export default function ChartSkeleton({ className = "", height = "200px" }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 bg-muted shimmer rounded-lg w-28" />
          <div className="h-3 bg-muted shimmer rounded-lg w-40" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-muted shimmer" />
      </div>
      
      <div className="relative flex items-end gap-3 pt-4" style={{ height }}>
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-border/40 w-full" />
          <div className="border-b border-border/40 w-full" />
          <div className="border-b border-border/40 w-full" />
          <div className="border-b border-border/40 w-full" />
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end justify-around h-full z-10 px-2">
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[40%]" />
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[65%]" />
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[50%]" />
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[85%]" />
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[30%]" />
          <div className="w-8 bg-muted shimmer rounded-t-lg h-[70%]" />
        </div>
      </div>
      
      {/* Legend / X Axis */}
      <div className="flex justify-between px-4 pt-1">
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
        <div className="h-2.5 bg-muted shimmer rounded w-8" />
      </div>
    </div>
  );
}
