import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { formatTime } from "../../utils/interviewHelpers";
import ScoreRing from "./ScoreRing";

export default function FloatingTimer({ onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [running]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-[var(--shadow-lg)] p-4 flex items-center gap-4 min-w-[220px] relative">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing value={Math.round(((seconds % 60) / 60) * 100)} size={52} stroke={4} />
          <span className="text-xs font-mono font-bold text-foreground tracking-widest">{formatTime(seconds)}</span>
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Practice Timer</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setRunning((value) => !value)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${running ? "bg-amber-500/10 text-amber-600" : "bg-primary text-white hover:bg-primary/90"}`}>
              {running ? <><Pause size={10} /> Pause</> : <><Play size={10} /> {seconds ? "Resume" : "Start"}</>}
            </button>
            <button onClick={() => { setSeconds(0); setRunning(false); }} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"><RotateCcw size={11} /></button>
          </div>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"><X size={10} /></button>
      </div>
    </div>
  );
}
