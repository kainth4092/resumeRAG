import { Sparkles, Target, MessageSquare } from "lucide-react";

export default function AISuggestions({ data }) {
  // Map API suggestions if available, otherwise use premium defaults
  const apiSuggestions = data?.resume_insights?.suggestions || [];
  
  const suggestions = apiSuggestions.length > 0
    ? apiSuggestions.map((s, idx) => {
        const priorities = ["High", "Medium", "Low"];
        const icons = [Sparkles, Target, MessageSquare];
        return {
          id: idx,
          title: s,
          desc: "AI suggested optimization based on your active resume.",
          priority: priorities[idx % 3],
          icon: icons[idx % 3],
        };
      })
    : [
        {
          id: 1,
          title: "Generate or upload your resume",
          desc: "Add your professional history to let our AI scan and score your profile.",
          priority: "High",
          icon: Sparkles,
        },
        {
          id: 2,
          title: "Track your job applications",
          desc: "Add target roles to Job Tracker to get personalized keyword matching.",
          priority: "Medium",
          icon: Target,
        },
        {
          id: 3,
          title: "Start an interview simulation",
          desc: "Run a simulated interview to test alignment and review live AI feedback.",
          priority: "Low",
          icon: MessageSquare,
        },
      ];

  const priorityStyles = {
    High: "text-red-500 bg-red-500/10",
    Medium: "text-amber-500 bg-amber-500/10",
    Low: "text-blue-500 bg-blue-500/10",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <h3 className="text-sm font-bold text-foreground">AI Career Copilot</h3>
        </div>
        <p className="text-xs text-muted-foreground">Smart suggestions to optimize your job search</p>
      </div>

      <div className="space-y-3 my-4 flex-1">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:border-muted-foreground/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={14} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground truncate leading-none">
                    {s.title}
                  </p>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 uppercase tracking-wider ${
                      priorityStyles[s.priority] || "text-muted-foreground bg-muted"
                    }`}
                  >
                    {s.priority}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
