
export default function CardSkeleton({ className = "", children }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 relative overflow-hidden ${className}`}>
      {children || (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted shimmer rounded-lg w-1/3" />
              <div className="h-3 bg-muted shimmer rounded-lg w-1/2" />
            </div>
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-3 bg-muted shimmer rounded-lg w-full" />
            <div className="h-3 bg-muted shimmer rounded-lg w-[92%]" />
            <div className="h-3 bg-muted shimmer rounded-lg w-[85%]" />
          </div>
        </div>
      )}
    </div>
  );
}
