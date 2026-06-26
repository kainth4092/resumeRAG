import { useEffect, useState } from "react";

function FloatingCard({ className, children }) {
    return (
        <div className={`absolute bg-white/10 dark:bg-white/8 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl ${className}`}>
            {children}
        </div>
    );
}

export function LoginIllustration() {
    const [score, setScore] = useState(67);
    useEffect(() => {
        const t = setTimeout(() => setScore(91), 800);
        return () => clearTimeout(t);
    }, []);

    const r = 38;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    return (
        <div className="relative w-full h-full flex items-center justify-center select-none">

            <div className="relative w-64 bg-white/12 backdrop-blur-xl border border-white/25 rounded-3xl p-6 shadow-2xl">

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">JD</span>
                    </div>
                    <div>
                        <div className="h-2.5 w-24 bg-white/50 rounded-full mb-1.5" />
                        <div className="h-2 w-16 bg-white/30 rounded-full" />
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="h-1.5 w-full bg-white/30 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-white/25 rounded-full" />
                    <div className="h-1.5 w-full bg-white/20 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-white/25 rounded-full" />
                </div>
                <div className="h-px bg-white/15 mb-4" />
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {["React", "TypeScript", "Node.js", "GraphQL"].map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-white/20 text-white/90 rounded-full border border-white/20">{s}</span>
                    ))}
                </div>
                <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-white/20 rounded-full" />
                    <div className="h-1.5 w-2/3 bg-white/15 rounded-full" />
                </div>
            </div>

            <FloatingCard className="-top-4 -right-8 w-36">
                <p className="text-[10px] text-white/60 mb-2 uppercase tracking-wider">ATS Score</p>
                <div className="flex items-center gap-3">
                    <svg width="52" height="52" viewBox="0 0 100 100" className="-rotate-90">
                        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                        <circle
                            cx="50" cy="50" r={r} fill="none"
                            stroke={score >= 85 ? "#34d399" : "#fbbf24"} strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            style={{ transition: "stroke-dashoffset 1.5s ease" }}
                        />
                    </svg>
                    <div>
                        <p className="text-2xl font-bold text-white leading-none">{score}</p>
                        <p className="text-[10px] text-emerald-300 mt-0.5">{score >= 85 ? "Excellent" : "Good"}</p>
                    </div>
                </div>
            </FloatingCard>

            <FloatingCard className="-bottom-6 -left-10 w-44">
                <p className="text-[10px] text-white/60 mb-2 uppercase tracking-wider">Keywords Matched</p>
                <div className="flex flex-wrap gap-1">
                    {[
                        { k: "React", ok: true }, { k: "AWS", ok: false }, { k: "Docker", ok: true },
                        { k: "TypeScript", ok: true }, { k: "K8s", ok: false },
                    ].map(({ k, ok }) => (
                        <span key={k} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ok ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30" : "bg-red-400/20 text-red-300 border border-red-400/30"}`}>
                            {ok ? "✓" : "✗"} {k}
                        </span>
                    ))}
                </div>
            </FloatingCard>

            <FloatingCard className="top-1/3 -right-14 w-40">
                <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-violet-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[9px] text-violet-200">✦</span>
                    </div>
                    <p className="text-[10px] text-white/75 leading-relaxed">Add quantified metrics to boost impact by 34%</p>
                </div>
            </FloatingCard>
        </div>
    );
}

export function SignupIllustration() {
    return (
        <div className="relative w-full h-full flex items-center justify-center select-none">

            <div className="relative w-64 bg-white/12 backdrop-blur-xl border border-white/25 rounded-3xl p-5 shadow-2xl">
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-3">Career Progress</p>

                <div className="flex items-end gap-2 h-20 mb-4">
                    {[40, 55, 48, 70, 65, 85, 91].map((v, i) => (
                        <div key={i} className="flex-1 rounded-t-md transition-all" style={{ height: `${v}%`, backgroundColor: i === 6 ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.2)" }} />
                    ))}
                </div>
                <div className="space-y-2">
                    {[
                        { label: "React", val: 90, color: "bg-violet-400" },
                        { label: "TypeScript", val: 75, color: "bg-blue-400" },
                        { label: "System Design", val: 55, color: "bg-amber-400" },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-white/60 w-20 flex-shrink-0">{s.label}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.val}%` }} />
                            </div>
                            <span className="text-[10px] text-white/60 w-6 text-right">{s.val}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <FloatingCard className="-top-6 -left-8 w-40">
                <p className="text-[10px] text-white/50 mb-2">Skill Gaps Found</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">4</span>
                    <div className="space-y-1">
                        <div className="h-1 w-16 bg-red-400/50 rounded-full" />
                        <div className="h-1 w-12 bg-amber-400/50 rounded-full" />
                        <div className="h-1 w-8 bg-emerald-400/50 rounded-full" />
                    </div>
                </div>
            </FloatingCard>

            <FloatingCard className="-bottom-4 -right-10 w-44">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-300 text-sm">✓</span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-white">Resume Generated</p>
                        <p className="text-[10px] text-white/50">ATS Score: 94/100</p>
                    </div>
                </div>
            </FloatingCard>

            <FloatingCard className="top-8 -right-12 w-36">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-400/30 flex items-center justify-center">
                        <span className="text-[10px] text-violet-200">✦</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-white">AI Analysis</p>
                        <p className="text-[10px] text-white/50">Ready in 3s</p>
                    </div>
                </div>
            </FloatingCard>
        </div>
    );
}

export function ForgotIllustration() {
    return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
            <div className="w-56 flex flex-col items-center gap-4">

                <div className="w-24 h-24 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center shadow-2xl">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <rect x="3" y="11" width="18" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                        <line x1="12" y1="17.5" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="relative w-full h-16 flex items-center justify-between px-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.8">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                    <div className="flex-1 flex items-center px-2 gap-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)", animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <p className="text-white/60 text-xs text-center">We'll send a reset link to your email address</p>
            </div>
        </div>
    );
}

export function VerifyIllustration() {
    return (
        <div className="relative w-full h-full flex items-center justify-center select-none">
            <div className="flex flex-col items-center gap-5">

                <div className="relative">
                    <div className="w-28 h-20 bg-white/15 border border-white/25 rounded-2xl flex flex-col items-center justify-center shadow-2xl">
                        <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
                            <rect x="1" y="1" width="50" height="34" rx="6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                            <path d="M1 8l25 16 25-16" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow">
                        <span className="text-white text-[11px] font-bold">!</span>
                    </div>
                </div>


                <div className="flex gap-2">
                    {["3", "7", "•", "•", "•", "•"].map((d, i) => (
                        <div key={i} className={`w-9 h-11 rounded-xl border flex items-center justify-center text-lg font-bold ${i < 2 ? "bg-violet-500/30 border-violet-400/50 text-white" : "bg-white/10 border-white/20 text-white/30"}`}>
                            {d}
                        </div>
                    ))}
                </div>


                <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`rounded-full ${i === 0 ? "w-4 h-1.5 bg-violet-400" : "w-1.5 h-1.5 bg-white/25"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
