import {
  Mic,
  Clock,
  Trophy,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export function InterviewTypeSelector({ onSelect, history, onReopenHistory }) {
  const handleStart = () => {
    onSelect("Real Voice Interview");
  };

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

  const phases = [
    {
      step: "01",
      title: "Introduction",
      desc: "Introduce yourself and walk us through your professional background.",
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      step: "02",
      title: "Project Breakdown",
      desc: "Discuss architecture, challenges faced, and trade-offs of your built projects.",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      step: "03",
      title: "Technical Skills",
      desc: "Answer core questions about Python (GIL), JS (closures), databases, etc.",
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    },
    {
      step: "04",
      title: "Scenario & Design",
      desc: "Solve situational system design and engineering failure scenario questions.",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-primary" /> AI Mock Interview
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          A realistic, continuous, voice-enabled interview simulation designed
          to evaluate your engineering expertise.
        </p>
      </div>

      <div>
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-sm hover:border-primary/10 transition-all duration-200">
          <div className="space-y-6">
            <div className="flex items-center border-b border-border pb-4 flex-wrap gap-2 justify-end text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1">
                <Clock size={12} /> 15-20 mins
              </span>
              <span>•</span>
              <span>8 Questions</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-base">
                Continuous Interview Flow
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This mock interview mimics a real hiring process. You will go
                through 4 sequential phases. Speak your answers into the
                microphone—the system transcribes and processes them
                collectively at the end for an in-depth performance analysis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {phases.map((phase) => (
                  <div
                    key={phase.step}
                    className="flex items-start gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-xl"
                  >
                    <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md self-start shrink-0">
                      {phase.step}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground">
                        {phase.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Microphone access required for speech-to-text transcription.
            </p>
            <button
              onClick={handleStart}
              className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Mic size={15} /> Start Voice Interview <ArrowRight size={14} />
            </button>
          </div>
        </div>
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
                      <span>{session.questions_attempted || 8} Questions</span>
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
                      onClick={handleStart}
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
