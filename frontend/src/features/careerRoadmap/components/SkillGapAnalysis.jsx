import { CheckCircle2, CircleAlert, CircleCheckBig } from "lucide-react";

export default function SkillGapAnalysis({
  currentSkills = [],
  requiredSkills = [],
}) {
  const missingSkills = requiredSkills.filter((skill) => !skill.matched);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Skills You Already Have */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Skills You Already Have
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Relevant profile skills that match your target role.
            </p>
          </div>

          <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
            {currentSkills.length} matched
          </span>
        </div>

        {currentSkills.length === 0 ? (
          <div className="py-6 text-center">
            <CircleAlert
              size={24}
              className="mx-auto text-muted-foreground mb-2"
            />
            <p className="text-sm font-medium text-foreground">
              No matching skills yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add your technical skills to your profile to get a more accurate
              readiness score and personalized roadmap.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skill) => (
              <div
                key={skill.name}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15"
              >
                <CheckCircle2 size={14} className="text-primary shrink-0" />

                <span className="text-xs font-medium text-foreground">
                  {skill.name}
                </span>

                <span className="text-[10px] font-semibold text-muted-foreground">
                  {skill.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing Skills */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Missing Skills — Gap Analysis
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Skills to prioritize for your selected target role.
            </p>
          </div>

          <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {missingSkills.length} missing
          </span>
        </div>

        {missingSkills.length === 0 ? (
          <div className="py-6 text-center">
            <CircleCheckBig
              size={26}
              className="mx-auto text-emerald-500 mb-2"
            />

            <p className="text-sm font-semibold text-foreground">
              All core skills matched
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Your profile covers all configured skills for this role and level.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {missingSkills.map((skill) => {
              const isHigh = skill.priority === "High";

              return (
                <div
                  key={skill.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/20"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {skill.name}
                    </p>

                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Weight: {skill.weight}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider ${
                      isHigh
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : skill.priority === "Medium"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {skill.priority}
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
