import { Shuffle } from "lucide-react";
import { CAT_CFG } from "../../data/interviewConstants";

export default function AISidebar({
  questions,
  session,
  onJumpRandom,
}) {
  const totalQuestions = questions.length;
  const bookmarked = questions.filter((q) => q.bookmarked).length;

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-4 py-3.5 border-b border-border bg-muted/20">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Questions Summary</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <p className="text-xl font-bold text-foreground">{totalQuestions}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total Questions</p>
            </div>
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <p className="text-xl font-bold text-amber-500">{bookmarked}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Bookmarked</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {Object.keys(CAT_CFG).map((cat) => {
              const count = questions.filter((q) => q.category === cat).length;
              if (!count) return null;
              const cfg = CAT_CFG[cat];
              const pct = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-20 truncate flex-shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 w-8 text-right font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={onJumpRandom}
            className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/15 text-primary rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <Shuffle size={13} /> Practice Random
          </button>
        </div>
      </div>
    </div>
  );
}
