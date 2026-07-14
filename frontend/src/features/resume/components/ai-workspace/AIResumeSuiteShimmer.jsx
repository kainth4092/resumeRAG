const Shimmer = ({ className = "" }) => {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-slate-200/80 dark:bg-slate-800
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
          via-white/70
          to-transparent
          dark:via-white/10
        "
      />
    </div>
  );
};

export default function AIResumeSuiteShimmer() {
  return (
    <div className="min-h-full bg-background px-5 py-6 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1155px]">
        {/* ================= PAGE HEADER ================= */}
        <div className="flex items-start gap-3 pb-5">
          {/* Header Icon */}
          <Shimmer className="mt-1 h-10 w-10 shrink-0 rounded-xl" />

          {/* Heading + Description */}
          <div className="space-y-2">
            <Shimmer className="h-5 w-40 rounded-md" />

            <div className="space-y-1.5">
              <Shimmer className="h-3 w-[500px] max-w-[70vw] rounded" />
              <Shimmer className="h-3 w-[410px] max-w-[60vw] rounded" />
            </div>
          </div>
        </div>

        {/* Header Divider */}
        <div className="mb-6 h-px w-full bg-border" />

        {/* ================= UPLOAD CARD ================= */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* ============== LEFT UPLOAD AREA ============== */}
            <div
              className="
                flex min-h-[147px]
                flex-col items-center justify-center
                rounded-2xl
                border-2 border-dashed
                border-border
                px-5 py-6
              "
            >
              {/* Upload Icon */}
              <Shimmer className="mb-4 h-10 w-10 rounded-full" />

              {/* Upload Title */}
              <Shimmer className="mb-2 h-3.5 w-32 rounded" />

              {/* Drag and Drop Text */}
              <Shimmer className="mb-2 h-3 w-44 rounded" />

              {/* File Type Text */}
              <Shimmer className="h-2.5 w-28 rounded" />
            </div>

            {/* ============== RIGHT SIDE ============== */}
            <div className="flex min-w-0 flex-col">
              {/* Select Resume Label */}
              <Shimmer className="mb-2 h-3 w-36 rounded" />

              {/* Resume Dropdown */}
              <Shimmer className="h-[34px] w-full rounded-xl" />

              {/* OR Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />

                <Shimmer className="h-2.5 w-5 rounded" />

                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Saved Profile Button */}
              <Shimmer className="h-[36px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
