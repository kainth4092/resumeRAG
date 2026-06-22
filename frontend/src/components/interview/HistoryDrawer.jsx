import { X, Trash2, Calendar, BookOpen, AlertCircle } from "lucide-react";
import ScoreRing from "./ScoreRing";

export default function HistoryDrawer({
    isOpen,
    onClose,
    history,
    activeSessionId,
    onSelectSession,
    onDeleteSession,
}) {
    if (!isOpen) return null;

    // Generate deterministic background color based on company name
    const getLogoBg = (name = "") => {
        const colors = ["#635BFF", "#5E6AD2", "#000000", "#10b981", "#ec4899", "#f59e0b"];
        if (!name) return colors[0];
        let sum = 0;
        for (let i = 0; i < name.length; i++) {
            sum += name.charCodeAt(i);
        }
        return colors[sum % colors.length];
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-card border-l border-border shadow-[var(--shadow-xl)] flex flex-col h-full animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                        <div>
                            <h2 className="text-foreground text-lg font-bold">Interview History</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Manage your past practice sessions</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center py-12 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                                    <AlertCircle size={22} />
                                </div>
                                <h3 className="font-semibold text-foreground text-sm">No Previous Sessions</h3>
                                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                    Generate an interview prep session using the setup form to start practicing.
                                </p>
                            </div>
                        ) : (
                            history.map(h => {
                                const active = h.id === activeSessionId;
                                return (
                                    <div
                                        key={h.id}
                                        onClick={() => {
                                            onSelectSession(h.id);
                                            onClose();
                                        }}
                                        className={`group relative bg-card border rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                                            active
                                                ? "border-primary bg-primary/[0.02]"
                                                : "border-border hover:border-primary/20 hover:bg-muted/10"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3 pr-6">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: getLogoBg(h.company) }}
                                                >
                                                    {h.company ? h.company[0].toUpperCase() : "I"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{h.company || "General"}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{h.role || "Target Role"}</p>
                                                </div>
                                            </div>
                                            <ScoreRing value={h.avg_score} size={36} stroke={3} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-1">
                                            <div className="p-2 bg-muted/30 rounded-xl flex items-center gap-2">
                                                <BookOpen size={12} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground leading-none">Questions</p>
                                                    <p className="text-xs font-bold text-foreground mt-0.5">{h.questions_count}</p>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-muted/30 rounded-xl flex items-center gap-2">
                                                <Calendar size={12} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground leading-none">Date</p>
                                                    <p className="text-xs font-bold text-foreground mt-0.5">
                                                        {new Date(h.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                onDeleteSession(h.id);
                                            }}
                                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            title="Delete session"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
