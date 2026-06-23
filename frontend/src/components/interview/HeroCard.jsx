import { BarChart3, Play } from "lucide-react";

export default function HeroCard({ session, setShowSidebar, questions, jumpToNext, DIFF_CFG }) {
    const bookmarkedCount = questions?.filter((q) => q.bookmarked).length || 0;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] relative">
            <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
            <div className="p-5 md:p-6">
                <div className="flex items-start gap-5 flex-wrap">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: session.logoColor }}
                    >
                        {session.companyLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                            <h2 className="text-foreground text-lg">{session.company || "Company"}</h2>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to Practice
                            </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{session.role || "Role"}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {[
                            { label: "Questions", value: session.questionCount || 0, color: "text-primary" },
                            { label: "Bookmarked", value: bookmarkedCount, color: "text-amber-500" },
                        ].map((s) => (
                            <div key={s.label} className="text-center px-4 py-2.5 bg-muted/40 rounded-xl border border-border">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={jumpToNext}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                        >
                            <Play size={14} /> Start Practice
                        </button>
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all"
                        >
                            <BarChart3 size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <span className="text-[11px] text-muted-foreground font-medium">Difficulty mix:</span>
                    {[
                        { label: "Easy", count: session.difficulty?.easy || 0, ...DIFF_CFG["Easy"] },
                        { label: "Medium", count: session.difficulty?.medium || 0, ...DIFF_CFG["Medium"] },
                        { label: "Hard", count: session.difficulty?.hard || 0, ...DIFF_CFG["Hard"] },
                    ].map((d) => (
                        <span
                            key={d.label}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: d.color, backgroundColor: d.bg, border: `1px solid ${d.border}` }}
                        >
                            {d.count} {d.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}