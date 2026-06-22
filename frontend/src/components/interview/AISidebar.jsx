import { Compass, RotateCw, Target, ChevronRight } from "lucide-react";
import ScoreRing from "./ScoreRing";
import { CAT_CFG } from "../../data/interviewConstants";

export default function AISidebar({
    questions,
    activeCategory,
    setActiveCategory,
    jumpToNext,
    jumpToRandom,
    retryIncorrect,
}) {
    const answered = questions.filter(q => q.answered).length;
    const total = questions.length;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    const categories = Array.from(new Set(questions.map(q => q.category)));

    const quickActions = [
        { label: "Next Unanswered", desc: "Jump to first pending question", icon: Target, click: jumpToNext },
        { label: "Random Drill", desc: "Select a random category question", icon: Compass, click: jumpToRandom },
        { label: "Review Weak Spots", desc: "Retry questions scored below 70%", icon: RotateCw, click: retryIncorrect },
    ];

    return (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
            {/* Progress Panel */}
            <div className="flex items-center gap-4 bg-muted/30 border border-border p-4 rounded-xl">
                <ScoreRing value={progress} size={56} stroke={5} />
                <div>
                    <h3 className="text-sm font-bold text-foreground">Session Progress</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {answered} of {total} completed
                    </p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Category Breakdown
                </h3>
                <div className="space-y-3">
                    {categories.map(cat => {
                        const cfg = CAT_CFG[cat];
                        if (!cfg) return null;
                        const catQs = questions.filter(q => q.category === cat);
                        const totalQs = catQs.length;
                        const doneQs = catQs.filter(q => q.answered).length;
                        const pct = totalQs > 0 ? Math.round((doneQs / totalQs) * 100) : 0;
                        const active = activeCategory === cat;

                        return (
                            <div
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                                    active
                                        ? "border-primary/20 bg-primary/[0.02]"
                                        : "border-transparent hover:border-border hover:bg-muted/30"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                                        {cat}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {doneQs}/{totalQs}
                                    </span>
                                </div>
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Quick Actions
                </h3>
                <div className="space-y-2">
                    {quickActions.map(a => (
                        <button
                            key={a.label}
                            onClick={a.click}
                            className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-left hover:border-primary/20 hover:bg-muted/15 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <a.icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                    {a.label}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">{a.desc}</p>
                            </div>
                            <ChevronRight size={12} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
