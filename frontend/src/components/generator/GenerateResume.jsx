import { Loader2, RefreshCw, Zap } from "lucide-react";


export default function GenerateResume({ analysis, generating, handleGenerate, generated }) {
    return (
        <>
            {analysis && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 transition-all shadow-sm shadow-primary/20"
                    >
                        {generating ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                <span>Generating resume...</span>
                            </>
                        ) : (
                            <><Zap size={15} /> {generated ? "Regenerate Resume" : "Generate Optimized Resume"}</>
                        )}
                    </button>
                    {generating && (
                        <div className="space-y-2">
                            {["Analyzing keywords...", "Restructuring experience...", "Optimizing ATS score..."].map((step, i) => (
                                <div key={step} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                                    <Loader2 size={11} className="animate-spin text-primary flex-shrink-0" />
                                    {step}
                                </div>
                            ))}
                        </div>
                    )}
                    {generated && (
                        <button
                            onClick={handleGenerate}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-all">
                            <RefreshCw size={13} /> Regenerate
                        </button>
                    )}
                </div>
            )}
        </>
    )
}