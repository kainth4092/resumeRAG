import { Timer, History, RefreshCw } from "lucide-react";

export default function Header({
    showTimer,
    setShowTimer,
    setShowHistory,
    onRegenerate,
    viewState,
}) {
    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 className="text-foreground text-3xl font-extrabold tracking-tight">Interview Prep</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Practice personalized interview questions generated from your resume and job description.
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <button
                    onClick={() => setShowTimer(t => !t)}
                    className={`flex items-center gap-1.5 h-9 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        showTimer
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                >
                    <Timer size={14} /> Timer
                </button>
                <button
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/30 transition-all"
                >
                    <History size={14} className="text-muted-foreground" /> History
                </button>
                {viewState === "active" && (
                    <button
                        onClick={onRegenerate}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm shadow-primary/20"
                    >
                        <RefreshCw size={14} /> New Session
                    </button>
                )}
            </div>
        </div>
    );
}