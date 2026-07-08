import { BookOpen, Code2, Lightbulb, Target, ArrowRight } from "lucide-react";

export default function RecommendationsAndProjects({
  recommendations = [],
  projects = [],
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
          Learning Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((r, i) => {
            let IconComp = Target;
            if (r.type === "Book") {
              IconComp = Lightbulb;
            } else if (r.title.toLowerCase().includes("kubernetes")) {
              IconComp = Code2;
            } else if (r.title.toLowerCase().includes("architect")) {
              IconComp = BookOpen;
            }

            const isHigh = r.priority === "High";

            return (
              <a
                key={i}
                href={r.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group border border-transparent hover:border-border no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComp size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.platform} · {r.time}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {r.priority}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Projects to Build Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
          Projects to Build
        </h3>
        <div className="space-y-3">
          {projects.map((p, i) => {
            const isHard = p.difficulty === "Hard";
            return (
              <a
                key={i}
                href={p.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-muted/30 transition-all duration-300 cursor-pointer group no-underline"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${
                      isHard
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold px-2.5 py-0.5 bg-muted rounded-full text-muted-foreground border border-border/60 hover:bg-muted/80 transition-colors"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
