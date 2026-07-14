import { Skeleton, SkeletonCircle, SkeletonText } from "./Skeleton";

export default function TableSkeleton({
  rows = 6,
  columns = 5,
  showAvatar = true,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div
        className="hidden min-h-12 items-center gap-5 border-b border-border bg-muted/30 px-5 md:flex"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          display: "grid",
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonText key={index} width={index === 0 ? "w-28" : "w-20"} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="
                flex flex-col gap-4
                px-5 py-5
                md:grid md:items-center
              "
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({
              length: columns,
            }).map((_, columnIndex) => (
              <div key={columnIndex} className="flex items-center gap-3">
                {columnIndex === 0 && showAvatar && <SkeletonCircle />}

                <div className="w-full space-y-2">
                  <SkeletonText width={columnIndex === 0 ? "w-32" : "w-20"} />

                  {columnIndex === 0 && (
                    <SkeletonText width="w-24" height="h-2.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
