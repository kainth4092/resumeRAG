import { CheckCircle2, Circle } from "lucide-react";

export default function TimelineRoadmap({
  periods = [],
  onToggleTask,
  isToggling,
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-5 tracking-tight">
        30–60–90 Day Roadmap
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {periods.map((period) => {
          const completedCount = period.items.filter((i) => i.done).length;
          const totalCount = period.items.length;
          const progressPercent =
            totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div
              key={period.period}
              className={`border rounded-xl p-4 transition-all duration-300 ${period.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">{period.period}</span>
                <span className="text-xs font-medium">
                  {completedCount}/{totalCount} Completed
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${period.barColor}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="space-y-3">
                {period.items.map((item, idx) => (
                  <button
                    key={idx}
                    disabled={isToggling}
                    onClick={() => onToggleTask(item.text, !item.done)}
                    className="flex items-start gap-2.5 w-full text-left bg-transparent border-0 p-0 hover:opacity-80 active:scale-99 transition-all cursor-pointer group disabled:cursor-not-allowed"
                  >
                    {item.done ? (
                      <CheckCircle2
                        size={15}
                        className="shrink-0 mt-0.5 text-inherit transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <Circle
                        size={15}
                        className="shrink-0 mt-0.5 opacity-60 text-inherit transition-transform group-hover:scale-110"
                      />
                    )}
                    <p
                      className={`text-xs leading-relaxed transition-all ${item.done ? "line-through opacity-50" : "font-medium"}`}
                    >
                      {item.text}
                    </p>
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
