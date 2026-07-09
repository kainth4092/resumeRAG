import { CheckCircle2, Circle, Clock3, Target } from "lucide-react";

export default function TimelineRoadmap({
  periods = [],
  onToggleTask,
  isToggling,
}) {
  if (!periods.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
        <Target size={28} className="mx-auto text-muted-foreground mb-3" />

        <h3 className="text-sm font-semibold text-foreground">
          No roadmap phases available
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          Update your target role or profile skills to generate your learning
          roadmap.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Your Personalized Learning Path
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          Complete these phases in order to close your most important skill
          gaps.
        </p>
      </div>

      <div className="space-y-4">
        {periods.map((phase, phaseIndex) => {
          const tasks = phase.tasks || [];

          const completedCount = tasks.filter((task) => task.completed).length;

          const totalCount = tasks.length;

          const progressPercent =
            totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0;

          return (
            <div
              key={phase.id || phaseIndex}
              className="border border-border rounded-xl p-4 bg-muted/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      Phase {phase.phase || phaseIndex + 1}
                    </span>

                    {phase.duration && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock3 size={11} />
                        {phase.duration}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-foreground">
                    {phase.title}
                  </h4>

                  {phase.goal && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                      {phase.goal}
                    </p>
                  )}
                </div>

                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {completedCount}/{totalCount} completed
                </span>
              </div>

              <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {phase.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {phase.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/5 text-primary border border-primary/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    disabled={isToggling}
                    onClick={() => onToggleTask(task.id)}
                    className="flex items-start gap-2.5 w-full text-left p-2.5 rounded-lg hover:bg-muted/50 transition-all cursor-pointer group disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {task.completed ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 mt-0.5 text-primary transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <Circle
                        size={16}
                        className="shrink-0 mt-0.5 text-muted-foreground transition-transform group-hover:scale-110"
                      />
                    )}

                    <div className="min-w-0">
                      <p
                        className={`text-xs leading-relaxed transition-all ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.skill && (
                        <span className="text-[10px] text-primary font-medium mt-1 inline-block">
                          {task.skill}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
