import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function KeywordAnalysis({ analysis }) {
    const matched = analysis?.matched_keywords || [];
    const missing = analysis?.missing_keywords || [];
    const total = matched.length + missing.length;
    const rate = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return (
        <>
            {analysis && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <h3 className="text-foreground">Keyword Analysis</h3>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Matched ({matched.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {matched.map(k => (
                                <span key={k} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/20">
                                    <CheckCircle2 size={11} /> {k}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Missing ({missing.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {missing.map(k => (
                                <span key={k} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold border border-red-500/20">
                                    <AlertCircle size={11} /> {k}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Keyword match rate</span>
                            <span className="text-xs font-bold text-foreground">{rate}%</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${rate}%` }} />
                        </div>
                    </div>
                </div>
            )}</>
    )
}