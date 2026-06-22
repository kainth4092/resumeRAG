export default function ScoreRing({ value, size = 48, stroke = 4 }) {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    const val = value ?? 0;
    const color = val >= 80 ? "#10b981" : val >= 65 ? "#f59e0b" : "#ef4444";
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted, #e5e7eb)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - circ * (val / 100)}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{val}%</span>
        </div>
    );
}
