import { BrainCircuit, Sparkles } from "lucide-react";

export default function EmptyState({ onAction, onGoGenerate }) {
  const handleAction = onAction || onGoGenerate;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-xl mx-auto">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
          <BrainCircuit size={40} className="text-primary animate-pulse" strokeWidth={1.5} />
        </div>
        {[
          { size: "w-2.5 h-2.5", top: "-top-2", right: "right-3", bg: "bg-emerald-500", delay: "delay-0" },
          { size: "w-2 h-2", bottom: "bottom-1", left: "-left-2", bg: "bg-amber-500", delay: "delay-300" },
          { size: "w-1.5 h-1.5", top: "top-8", left: "-left-2.5", bg: "bg-primary", delay: "delay-700" },
        ].map((d, i) => (
          <div key={i} className={`absolute ${d.size} ${d.bg} rounded-full animate-bounce ${d.delay} ${d.top || ""} ${d.right || ""} ${d.bottom || ""} ${d.left || ""}`} />
        ))}
      </div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2.5">No Questions Found</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        We couldn't find any questions matching your current filters. Try resetting the filters or generate a new batch of questions from your resume and job description.
      </p>
      <button onClick={handleAction} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 cursor-pointer">
        <Sparkles size={14} /> Generate Questions
      </button>
    </div>
  );
}
