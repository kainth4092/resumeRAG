import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2 } from "lucide-react";

const steps = [
  "Analyzing resume details...",
  "Correlating with job description...",
  "Injecting RAG context...",
  "Synthesizing customized questions...",
  "Ready!"
];

export default function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative">
        <BrainCircuit size={28} className="text-primary" />
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">Generating Questions</h3>
      <p className="text-xs text-muted-foreground mb-6">Our AI is parsing your files to curate the best prep material.</p>
      <div className="w-full space-y-2.5">
        {steps.map((text, idx) => {
          const isDone = idx < step;
          const isActive = idx === step;
          return (
            <div
              key={text}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? "bg-primary/5 border-primary/20 scale-[1.02]" :
                  isDone ? "bg-muted/30 border-transparent opacity-80" : "bg-transparent border-transparent opacity-30"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-white animate-pulse" : "bg-muted"
                  }`}
              >
                {isDone ? <CheckCircle2 size={11} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className="text-xs font-semibold text-foreground">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
