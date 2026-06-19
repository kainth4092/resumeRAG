import { Loader2, Zap } from "lucide-react";

export default function JobDescription({ jd, setJd, uploaded, handleAnalyze, analyzing }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-foreground mb-4">Job Description</h3>
            <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the full job description here — include requirements, responsibilities, and company info for the best match..."
                className="w-full h-36 px-4 py-3 bg-input-background border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground">{jd.length} chars · {jd.split(/\s+/).filter(Boolean).length} words</p>
                <button
                    onClick={handleAnalyze}
                    disabled={!jd || !uploaded || analyzing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Zap size={14} /> Analyze JD</>}
                </button>
            </div>
        </div>
    )
}