import { Zap } from "lucide-react";

const STATS = [
  { value: "94%", label: "Avg ATS Score" },
  { value: "3×", label: "More Interviews" },
  // { value: "50K+", label: "Resumes Created" },
];

export function AuthLayout({
  illustration,
  leftTitle,
  leftSubtitle,
  testimonial,
  children,
}) {
  return (
    <div
      className="bg-background flex"
      style={{ minHeight: "calc(105vh - 28px)" }}
    >
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-linear-to-br from-[#464547] via-[#5b21b6] to-[#6d28d9]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-800/40 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-2xl" />

        <div className="relative flex-1 flex flex-col px-12 py-10 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-md leading-none block">
                ResuPilot AI
              </span>
              <span className="text-violet-300 text-xs tracking-widest uppercase">
                Powered by AI
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-8 px-6">
            <div className="w-full max-w-sm h-80 relative">{illustration}</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2 leading-snug">
              {leftTitle}
            </h2>
            <p className="text-violet-200/80 text-sm leading-relaxed max-w-xs">
              {leftSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/8 border border-white/15 rounded-xl p-3 text-center backdrop-blur-sm"
              >
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-violet-200/70 mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {testimonial && (
            <div className="bg-white/8 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/85 leading-relaxed mb-3">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-[11px] text-violet-200/60">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-foreground">ResuPilot AI</span>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
