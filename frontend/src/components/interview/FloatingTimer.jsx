import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, X, Timer } from "lucide-react";
import { formatTime } from "../../utils/interviewHelpers";

export default function FloatingTimer({ showTimer, setShowTimer }) {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        let interval = null;
        if (showTimer && running) {
            interval = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [showTimer, running]);

    if (!showTimer) return null;

    return (
        <div className="fixed bottom-6 right-6 bg-card border border-border rounded-2xl shadow-[var(--shadow-lg)] z-40 p-3.5 flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Timer size={16} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    Practice Timer
                </p>
                <p className="text-sm font-bold text-foreground font-mono leading-none">
                    {formatTime(time)}
                </p>
            </div>
            <div className="h-6 w-px bg-border mx-1" />
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={() => setRunning(!running)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    {running ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                    onClick={() => {
                        setTime(0);
                        setRunning(false);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <RotateCcw size={12} />
                </button>
                <button
                    onClick={() => setShowTimer(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
}
