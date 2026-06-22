import { ChevronRight, Eye, FileText, RefreshCw, Shuffle, SkipForward } from "lucide-react";
import { CAT_CFG } from "../../data/interviewConstants";
import ScoreRing from "./ScoreRing";

export default function AISidebar({
  questions,
  session,
  onJumpNext,
  onJumpRandom,
  onRetryIncorrect,
}) {
  const answered = questions.filter((q) => q.answered).length;
  const bookmarked = questions.filter((q) => q.bookmarked).length;
  const withEval = questions.filter((q) => q.evaluation);
  const avg = withEval.length ? Math.round(withEval.reduce((s, q) => s + (q.evaluation?.overall ?? 0), 0) / withEval.length) : 0;
  const progress = Math.round((answered / questions.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-4 py-3.5 border-b border-border bg-muted/20">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Session Progress</p>
        </div>
        <div className="p-4 space-y-4">
          {/* Big ring */}
          <div className="flex items-center gap-4">
            <ScoreRing value={progress} size={60} stroke={5} />
            <div>
              <p className="text-xl font-bold text-foreground">
                {answered}
                <span className="text-sm text-muted-foreground font-normal">/{questions.length}</span>
              </p>
              <p className="text-xs text-muted-foreground">Questions done</p>
            </div>
          </div>
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Avg Score",
                value: avg > 0 ? `${avg}%` : "—",
                color: avg >= 80 ? "text-emerald-600 dark:text-emerald-400" : avg >= 65 ? "text-amber-600" : "text-foreground",
              },
              { label: "Bookmarked", value: bookmarked, color: "text-amber-500" },
              { label: "Remaining", value: questions.length - answered, color: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="p-2.5 bg-muted/40 rounded-xl text-center">
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Category mini breakdown */}
          <div className="space-y-2">
            {(Object.keys(CAT_CFG)).map((cat) => {
              const total = questions.filter((q) => q.category === cat).length;
              const done = questions.filter((q) => q.category === cat && q.answered).length;
              if (!total) return null;
              const cfg = CAT_CFG[cat];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-20 truncate flex-shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(done / total) * 100}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 w-8 text-right">
                    {done}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-4 py-3.5 border-b border-border bg-muted/20">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Quick Actions</p>
        </div>
        <div className="p-3 space-y-1.5">
          {[
            { icon: SkipForward, label: "Next Unanswered", action: onJumpNext, color: "text-primary" },
            { icon: Shuffle, label: "Random Question", action: onJumpRandom, color: "text-blue-500" },
            { icon: RefreshCw, label: "Retry Low Scores", action: onRetryIncorrect, color: "text-amber-500" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm text-foreground transition-all group"
            >
              <a.icon size={14} className={`${a.color} flex-shrink-0`} />
              <span className="flex-1 text-left text-sm font-medium">{a.label}</span>
              <ChevronRight size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Resume snapshot */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-4 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Resume Used</p>
          <button className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-1">
            <Eye size={10} /> View
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{session.resumeUsed || "Resume"}</p>
              <p className="text-[11px] text-muted-foreground">
                ATS Score: <span className="font-bold text-emerald-600 dark:text-emerald-400">{session.atsScore || 0}/100</span>
              </p>
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${session.atsScore || 0}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Optimized for {session.company || "Company"} · {session.role || "Role"}
          </p>
        </div>
      </div>

      {/* JD summary */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-4 py-3.5 border-b border-border bg-muted/20">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Job Description</p>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {session.role || "Role"} at {session.company || "Company"}. Focus areas: React/TypeScript, real-time systems, developer experience. 5–8 years required.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "GraphQL", "AWS", "Node.js"].map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 bg-muted border border-border rounded-lg text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
