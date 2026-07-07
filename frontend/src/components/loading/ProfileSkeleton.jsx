import CardSkeleton from "./CardSkeleton";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 bg-muted shimmer rounded-lg w-48" />
        <div className="h-4 bg-muted shimmer rounded-lg w-72" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <CardSkeleton className="lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-24 h-24 rounded-full bg-muted shimmer" />
            <div className="space-y-2">
              <div className="h-5 bg-muted shimmer rounded w-36 mx-auto" />
              <div className="h-3 bg-muted shimmer rounded w-48 mx-auto" />
            </div>
            <div className="h-8 bg-muted shimmer rounded-xl w-32 pt-2" />
          </div>
        </CardSkeleton>

        {/* Right Column: Profile Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton>
            <div className="space-y-6">
              <div className="h-5 bg-muted shimmer rounded w-40 mb-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-muted shimmer rounded w-20" />
                    <div className="h-10 bg-muted/65 shimmer rounded-xl w-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-3 bg-muted shimmer rounded w-16" />
                <div className="h-20 bg-muted/65 shimmer rounded-xl w-full" />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40">
                <div className="h-10 bg-muted shimmer rounded-xl w-28" />
              </div>
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}
