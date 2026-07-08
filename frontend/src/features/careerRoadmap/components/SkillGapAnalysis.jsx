export default function SkillGapAnalysis({
  currentSkills = [],
  requiredSkills = [],
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Current Skills Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
          Current Skills
        </h3>
        {currentSkills.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4">
            No skills registered yet. Update your profile skills to see them
            here.
          </p>
        ) : (
          <div className="space-y-4">
            {currentSkills.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium text-foreground w-28 truncate"
                  title={s.name}
                >
                  {s.name}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary w-8 text-right">
                  {s.level}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Required Skills Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
          Required Skills — Gap Analysis
        </h3>
        {requiredSkills.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4">
            You match all core required skills for this role! Great job!
          </p>
        ) : (
          <div className="space-y-4">
            {requiredSkills.map((s) => {
              const gapColor = s.gap === "high" ? "#ef4444" : "#f59e0b";
              const isHigh = s.gap === "high";
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium text-foreground w-28 truncate"
                    title={s.name}
                  >
                    {s.name}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${s.level}%`,
                        backgroundColor: gapColor,
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold w-8 text-right ${isHigh ? "text-red-500" : "text-amber-500"}`}
                  >
                    {s.level}%
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${
                      isHigh
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {s.gap}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
