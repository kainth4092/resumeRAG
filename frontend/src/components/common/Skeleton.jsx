export function Skeleton({ className = "", rounded = "rounded-xl" }) {
  return (
    <div
      aria-hidden="true"
      className={`
        relative overflow-hidden
        bg-muted/70
        ${rounded}
        ${className}
      `}
    >
      <div
        className="
          absolute inset-0
          -translate-x-full
          animate-[shimmer_1.6s_infinite]
          bg-gradient-to-r
          from-transparent
          via-foreground/[0.07]
          to-transparent
        "
      />
    </div>
  );
}

export function SkeletonText({
  width = "w-full",
  height = "h-3",
  className = "",
}) {
  return (
    <Skeleton
      className={`${width} ${height} ${className}`}
      rounded="rounded-md"
    />
  );
}

export function SkeletonCircle({ size = "h-10 w-10", className = "" }) {
  return (
    <Skeleton
      className={`${size} shrink-0 ${className}`}
      rounded="rounded-full"
    />
  );
}

export function SkeletonCard({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-2xl
        border border-border
        bg-card
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}
