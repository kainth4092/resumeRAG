import { Brain, BookOpen, Clock, Play } from "lucide-react";

export default function ChallengeLanding({ step, error, onStartClick }) {
  const topicsList = [
    "Python", "JavaScript", "React", "HTML", "CSS", "SQL",
    "FastAPI", "DBMS", "OOP"
  ];

  return (
    <>
      {step === "landing" && (
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <Brain size={32} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Phase 1
            </span>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight mt-2">Time Capsule</h2>
            <p className="text-sm font-semibold text-primary">Random, high-priority questions.</p>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Test your technical strength under pressure. You will have exactly 10 minutes to solve 20 randomized multiple-choice questions fetched directly from the high-priority question bank.
            </p>
          </div>

          <div className="flex gap-8 py-2">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">20 Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">10 Minutes</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            onClick={onStartClick}
            className="flex items-center justify-center gap-2 h-11 px-8 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Play size={13} fill="currentColor" /> Start Challenge
          </button>

          <div className="w-full border-t border-border pt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Topics Included
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {topicsList.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 bg-muted text-muted-foreground border border-border rounded-lg text-[10px] font-bold"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
