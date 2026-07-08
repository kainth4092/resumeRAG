import { Target } from "lucide-react";

export default function TargetRoleBanner({
  targetRole,
  targetLevel,
  readiness,
}) {
  return (
    <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner">
          <Target size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Target: {targetRole}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{targetLevel}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto min-w-[200px] sm:min-w-[240px]">
        <span className="text-xs text-muted-foreground font-medium">
          Readiness:
        </span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${readiness}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-primary">{readiness}%</span>
      </div>
    </div>
  );
}
