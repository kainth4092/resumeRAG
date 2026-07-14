const Shimmer = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-muted/70 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
  </div>
);

export default function SettingsSkeleton() {
  return (
    <div className="min-h-full bg-background px-5 py-6 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1155px]">
        {/* Page Header */}
        <div className="flex items-center gap-3 pb-5">
          <Shimmer className="h-10 w-10 rounded-xl" />

          <div className="space-y-2">
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-3 w-[390px] max-w-[70vw]" />
          </div>
        </div>

        <div className="mb-6 h-px w-full bg-border" />

        {/* Main Settings Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[225px_minmax(0,1fr)]">
          {/* Left Settings Navigation */}
          <div className="h-fit rounded-2xl border border-border bg-card p-2">
            {[
              "Account",
              "Security",
              "Notifications",
              "Appearance",
              "Data & Privacy",
            ].map((item, index) => (
              <div
                key={item}
                className={`mb-1 flex h-[43px] items-center gap-3 rounded-xl px-4 ${
                  index === 0 ? "bg-primary/10" : ""
                }`}
              >
                <Shimmer className="h-5 w-5 rounded-md" />
                <Shimmer
                  className={`h-3 ${
                    index === 2 ? "w-24" : index === 4 ? "w-20" : "w-16"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Right Settings Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            {/* Section Heading */}
            <Shimmer className="mb-5 h-6 w-48" />

            {/* User Information Preview */}
            <div className="mb-5 flex items-center gap-4 rounded-2xl border border-border p-4">
              <Shimmer className="h-14 w-14 shrink-0 rounded-xl" />

              <div className="space-y-2">
                <Shimmer className="h-4 w-28" />
                <Shimmer className="h-3 w-40" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-[42px] w-full rounded-xl" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-[42px] w-full rounded-xl" />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-[42px] w-full rounded-xl" />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-[42px] w-full rounded-xl" />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Shimmer className="h-3 w-14" />
                <Shimmer className="h-[42px] w-full rounded-xl" />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Shimmer className="h-[38px] w-[150px] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
