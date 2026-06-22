import { FileText, Star, Clock, Play, BarChart3 } from "lucide-react";
import { DIFF_CFG } from "../../data/interviewConstants";

export default function HeroCard({
    session,
    questions,
    jumpToNext,
    setShowSidebar,
    navigate,
}) {
    if (!session) return null;

    const answered = questions.filter(q => q.answered).length;
    const totalQuestions = questions.length;
    const progressPercent = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

    const easyCount = questions.filter(q => q.difficulty === "Easy").length;
    const mediumCount = questions.filter(q => q.difficulty === "Medium").length;
    const hardCount = questions.filter(q => q.difficulty === "Hard").length;

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
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] relative">
            <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            <div className="p-5 md:p-6">
                <div className="flex items-start gap-5 flex-wrap">
                    {/* Logo */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: getLogoBg(session.company) }}
                    >
                        {session.company ? session.company[0].toUpperCase() : "I"}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                            <h2 className="text-foreground text-lg font-bold">{session.company || "Interview Session"}</h2>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to Practice
                            </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{session.role || "Target Role"}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <FileText size={11} /> Resume #{session.resume_id}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={11} /> Generated {new Date(session.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {/* Stats chips */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {[
                            { label: "Questions", value: totalQuestions, color: "text-primary" },
                            { label: "Answered", value: answered, color: "text-emerald-600 dark:text-emerald-400" },
                        ].map(s => (
                            <div key={s.label} className="text-center px-4 py-2.5 bg-muted/40 rounded-xl border border-border">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={jumpToNext}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                        >
                            <Play size={14} /> Start Practice
                        </button>
                        <button
                            onClick={() => navigate("/resumes")}
                            className="flex items-center gap-2 px-3.5 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-all"
                        >
                            <FileText size={13} /> My Resumes
                        </button>
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all"
                        >
                            <BarChart3 size={14} />
                        </button>
                    </div>
                </div>

                {/* Difficulty pills */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-medium">Difficulty mix:</span>
                    {[
                        { label: "Easy", count: easyCount, ...DIFF_CFG["Easy"] },
                        { label: "Medium", count: mediumCount, ...DIFF_CFG["Medium"] },
                        { label: "Hard", count: hardCount, ...DIFF_CFG["Hard"] },
                    ].map(d => (
                        <span
                            key={d.label}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                                color: d.color,
                                backgroundColor: d.bg,
                                border: `1px solid ${d.border}`,
                            }}
                        >
                            {d.count} {d.label}
                        </span>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                        <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{progressPercent}% complete</span>
                    </div>
                </div>
            </div>
        </div>
    );
}