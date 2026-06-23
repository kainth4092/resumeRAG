import { ArrowRight, BrainCircuit, Mic, Sparkles, Target, TrendingUp, Zap } from "lucide-react";

export default function EmptyState({ onGoGenerate }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-[var(--shadow-md)]">
          <BrainCircuit size={44} className="text-primary" strokeWidth={1.5} />
        </div>
        {[
          { size: 8, top: -4, right: 12, bg: "#10b981", delay: "0s" },
          { size: 6, bottom: 4, left: -8, bg: "#f59e0b", delay: "0.7s" },
          { size: 5, top: 10, left: -10, bg: "#7C3AED", delay: "1.4s" },
        ].map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              width: d.size,
              height: d.size,
              backgroundColor: d.bg,
              top: d.top,
              right: d.right,
              bottom: d.bottom,
              left: d.left,
              animationDelay: d.delay,
              animationDuration: "2.5s",
            }}
          />
        ))}
      </div>
      <h2 className="text-xl font-bold text-foreground mb-3">No Interview Questions Available</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8">
        No interview session has been generated yet. Create one from the generator after uploading a resume and adding a job description.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { icon: Sparkles, label: "AI-Matched Questions" },
          { icon: Target, label: "Role-Specific" },
          { icon: TrendingUp, label: "Score Tracking" },
          { icon: Mic, label: "Voice Practice" },
        ].map((f) => (
          <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-medium text-muted-foreground">
            <f.icon size={11} className="text-primary" />
            {f.label}
          </span>
        ))}
      </div>
      <button onClick={onGoGenerate} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20">
        <Zap size={15} /> Go to Resume Generator <ArrowRight size={14} />
      </button>
    </div>
  );
}
