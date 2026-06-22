import { BrainCircuit, CheckCircle2, BookmarkCheck, Trophy } from "lucide-react";

export default function StatsCards({ questions }) {
    const total = questions.length;
    const answered = questions.filter(q => q.answered).length;
    const bookmarked = questions.filter(q => q.bookmarked).length;

    const evaluatedQs = questions.filter(q => q.evaluation);
    const avgScore = evaluatedQs.length > 0
        ? Math.round(evaluatedQs.reduce((sum, q) => sum + (q.evaluation?.overall ?? 0), 0) / evaluatedQs.length)
        : null;

    const stats = [
        { label: "Questions", value: total, icon: BrainCircuit, color: "#7C3AED", bg: "#f5f3ff" },
        { label: "Answered", value: answered, icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
        { label: "Bookmarked", value: bookmarked, icon: BookmarkCheck, color: "#f59e0b", bg: "#fffbeb" },
        {
            label: "Avg Score",
            value: avgScore !== null ? `${avgScore}%` : "—",
            icon: Trophy,
            color: "#3b82f6",
            bg: "#eff6ff",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
                <div
                    key={s.label}
                    className="bg-card border border-border rounded-2xl p-4 hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5 transition-all duration-200"
                >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
                        <s.icon size={17} style={{ color: s.color }} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
                </div>
            ))}
        </div>
    );
}
