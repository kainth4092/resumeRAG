import { useState } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export default function EvaluationPanel({ evaluation, onDismiss }) {
  const [vote, setVote] = useState(null);
  const safeEvaluation = {
    overall: 0,
    technical: 0,
    communication: 0,
    confidence: 0,
    strengths: [],
    weaknesses: [],
    missingPoints: [],
    improvedAnswer: "",
    followUps: [],
    ...evaluation,
  };
  const color = safeEvaluation.overall >= 80 ? "#10b981" : safeEvaluation.overall >= 65 ? "#f59e0b" : "#ef4444";
  const strengths = asArray(safeEvaluation.strengths);
  const weaknesses = asArray(safeEvaluation.weaknesses);
  const missingPoints = asArray(safeEvaluation.missingPoints);
  const followUps = asArray(safeEvaluation.followUps);

  return (
    <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary/12">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center"><Sparkles size={13} className="text-primary" /></div>
          <div><p className="text-sm font-bold text-foreground">AI Evaluation</p><p className="text-[11px] text-muted-foreground">Powered by ResumeRAG AI</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center"><div className="text-xl font-bold" style={{ color }}>{safeEvaluation.overall}</div><div className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</div></div>
          <button onClick={onDismiss} className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X size={13} /></button>
        </div>
      </div>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ScoreBar label="Technical Depth" value={safeEvaluation.technical} color="#7C3AED" />
          <ScoreBar label="Communication" value={safeEvaluation.communication} color="#3b82f6" />
          <ScoreBar label="Confidence" value={safeEvaluation.confidence} color="#10b981" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 size={10} /> Strengths</p><ul className="space-y-1.5">{strengths.map((item, index) => <li key={index} className="flex items-start gap-2 text-[11px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />{item}</li>)}</ul></div>
          <div><p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle size={10} /> Areas to Improve</p><ul className="space-y-1.5">{weaknesses.map((item, index) => <li key={index} className="flex items-start gap-2 text-[11px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />{item}</li>)}</ul></div>
        </div>
        {missingPoints.length > 0 && <div><p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle size={10} /> Missing Key Points</p><div className="flex flex-wrap gap-1.5">{missingPoints.map((item, index) => <span key={index} className="text-[11px] px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl font-medium">{item}</span>)}</div></div>}
        <div className="bg-card border border-border rounded-xl p-4"><p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5"><Sparkles size={10} /> Suggested Better Answer</p><p className="text-[11px] text-muted-foreground leading-relaxed">{safeEvaluation.improvedAnswer}</p></div>
        <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Follow-up Questions</p><div className="space-y-1.5">{followUps.map((item, index) => <div key={index} className="flex items-start gap-2 p-2.5 bg-muted/40 rounded-xl"><ChevronRight size={12} className="text-primary flex-shrink-0 mt-0.5" /><p className="text-[11px] text-foreground">{item}</p></div>)}</div></div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <div className="flex gap-2">
            {[{ value: true, icon: ThumbsUp, label: "Yes", active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" }, { value: false, icon: ThumbsDown, label: "No", active: "bg-red-500/10 border-red-500/30 text-red-500" }].map((button) => (
              <button key={button.label} onClick={() => setVote(button.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${vote === button.value ? button.active : "border-border text-muted-foreground hover:bg-muted"}`}><button.icon size={11} />{button.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
