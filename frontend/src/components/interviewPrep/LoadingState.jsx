import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2 } from "lucide-react";

function Skeleton({ className }) {
  return <div className={`bg-muted animate-pulse ${className}`} />;
}

export default function LoadingState() {
  const [step, setStep] = useState(0);
  const steps = [
    "Loading your interview session…",
    "Personalizing questions from resume…",
    "Calibrating AI difficulty…",
    "Ready!",
  ];

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 650);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative">
        <BrainCircuit size={32} className="text-primary" />
        <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-ping" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-6">AI is preparing your interview…</h2>
      <div className="space-y-2 w-full max-w-xs mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i <= step ? "bg-primary/5 border border-primary/12" : "opacity-25"}`}>
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < step ? "bg-emerald-500" : i === step ? "bg-primary animate-pulse" : "bg-muted"
                }`}
            >
              {i < step && <CheckCircle2 size={10} className="text-white" />}
            </div>
            <span className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-md space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
            <div className="flex gap-3 items-center">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-14 h-5 rounded-full" />
            </div>
            <Skeleton className="w-4/5 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
