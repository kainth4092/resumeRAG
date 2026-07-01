import {
  Users,
  Code2,
  FolderOpen,
  BrainCircuit,
  Calendar,
  Clock,
  Trophy,
  Eye,
  RefreshCw,
} from "lucide-react";

export function InterviewTypeSelector({ onSelect, history, onReopenHistory }) {
  const cards = [
    {
      id: "HR Interview",
      title: "HR Interview",
      desc: "Practice behavioral, cultural, background, and general HR questions to present yourself professionally.",
      duration: "10-15 mins",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      btnColor: "bg-blue-600 hover:bg-blue-600/95",
    },
    {
      id: "Technical Interview",
      title: "Technical Interview",
      desc: "Simulate a live technical assessment covering programming logic, system design, and role-specific syntax.",
      duration: "15-20 mins",
      icon: Code2,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      btnColor: "bg-purple-600 hover:bg-purple-600/95",
    },
    {
      id: "Project Interview",
      title: "Project Interview",
      desc: "Discuss architectural choices, tech stack selection, challenges faced, and trade-offs of your built projects.",
      duration: "10-15 mins",
      icon: FolderOpen,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      btnColor: "bg-pink-600 hover:bg-pink-600/95",
    },
    {
      id: "Behavioral Interview",
      title: "Behavioral Interview",
      desc: "Answer STAR-method situational questions focusing on teamwork, problem solving, conflicts, and leadership.",
      duration: "10-15 mins",
      icon: BrainCircuit,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      btnColor: "bg-emerald-600 hover:bg-emerald-600/95",
    },
  ];

  const formatDuration = (secs) => {
    if (!secs) return "0s";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`;
  };

  const getGradeColor = (grade) => {
    if (["A+", "A"].includes(grade))
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (grade === "B+")
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (grade === "B")
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Select Mock Interview Type
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Each session consists of 5 balanced questions. Answer using your
          microphone for real-time analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}
                >
                  <Icon size={24} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-base">
                      {card.title}
                    </h3>
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                      <Clock size={10} />
                      {card.duration}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => onSelect(card.id)}
                  className="w-full h-10 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Start Interview
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {history && history.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Recent Mock Interviews
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Reopen past reports or instantly retake similar mock sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {history.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/25 hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-foreground">
                        {session.interview_type}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getGradeColor(session.overall_grade || "B")}`}
                      >
                        Grade {session.overall_grade || "B"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      <Calendar size={10} />
                      {new Date(session.created_at).toLocaleDateString()}
                      <span>•</span>
                      <Clock size={10} />
                      {formatDuration(session.duration)} duration
                      <span>•</span>
                      <span>{session.questions_attempted || 5} Questions</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[9px] font-semibold text-muted-foreground block">
                      Overall Score
                    </span>
                    <p className="text-sm font-bold text-primary">
                      {session.overall_score}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReopenHistory(session)}
                      className="h-8 px-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                      title="View Report"
                    >
                      <Eye size={12} /> View Report
                    </button>
                    <button
                      onClick={() => onSelect(session.interview_type)}
                      className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                      title="Retake Session"
                    >
                      <RefreshCw size={11} /> Retake
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
