import { Shuffle, FileText } from "lucide-react";
import { CAT_CFG } from "../../data/interviewConstants";

export default function AISidebar({
  questions = [],
  session,
  onJumpRandom,
}) {
  if (!session) return null;

  const bookmarked = questions.filter((q) => q.bookmarked).length;
  const totalMins = questions.reduce((s, q) => s + (q.estimatedMins || 3), 0);

  const catCounts = Object.keys(CAT_CFG).map((cat) => ({
    cat,
    count: questions.filter((q) => q.category === cat).length,
  })).filter((c) => c.count > 0);

  const logoText = session.companyLogo || (session.company ? session.company[0].toUpperCase() : "P");
  const atsScore = session.atsScore || 85;

  return (
    <div className="space-y-4">
      {/* Progress card */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3.5">Interview Progress</h3>
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Total Questions</span>
            <span className="text-sm font-bold text-foreground">{questions.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Bookmarked</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/15">
              {bookmarked}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Est. Reading Time</span>
            <span className="text-sm font-bold text-foreground">{totalMins} mins</span>
          </div>
        </div>
        {onJumpRandom && questions.length > 0 && (
          <button
            onClick={onJumpRandom}
            className="w-full flex items-center justify-center gap-1.5 mt-3.5 h-9 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Shuffle size={12} /> Practice Random
          </button>
        )}
      </div>

      {/* Session details */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3.5">Session</h3>
        <div className="flex items-center gap-3 pb-3 border-b border-border mb-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: session.logoColor || "#635BFF" }}
          >
            {logoText}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{session.company || "Company"}</p>
            <p className="text-xs text-muted-foreground font-medium truncate">{session.role || "Role"}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">Resume</span>
            <span className="text-xs font-bold text-foreground text-right truncate max-w-[140px]">
              {session.resumeUsed || "Selected Resume"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">ATS Match</span>
            <span className="text-xs font-bold text-foreground">{atsScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Generated</span>
            <span className="text-xs font-semibold text-muted-foreground">{session.generatedAt}</span>
          </div>
        </div>
      </div>

      {/* Breakdown card */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3.5">By Category</h3>
        <div className="space-y-2">
          {catCounts.map(({ cat, count }) => {
            const cfg = CAT_CFG[cat] || { icon: FileText, color: "#9ca3af", bg: "#f3f4f6" };
            const Icon = cfg.icon;
            return (
              <div
                key={cat}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                    <Icon size={12} style={{ color: cfg.color }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{cat}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
