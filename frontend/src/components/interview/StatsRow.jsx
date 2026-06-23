import { STATS_ROW } from "../../data/interviewConstants";

export default function StatsRow({ session, answered, questions }) {
    return (
        <>
            {STATS_ROW(session, answered, questions).map((s) => (
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
        </>
    )
}