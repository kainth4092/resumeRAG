export default function CircularScore({ score, size = 130 }) {
    const r = (size / 2) - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth="9" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground leading-none">{score}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">/100</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-semibold" style={{ color }}>
                    {score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Needs Work"}
                </span>
            </div>
        </div>
    );
}