import { Clock, FileText } from "lucide-react";

export default function VersionHistory({ showHistory, versions }) {
    return (
        <> {(showHistory || versions.length > 0) && (
            <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <h3 className="text-foreground">Version History</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{versions.length} versions</span>
                </div>
                <div className="space-y-2">
                    {versions.map(v => (
                        <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${v.active ? "bg-primary/8 border border-primary/20" : "hover:bg-muted border border-transparent"}`}>
                            <div className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                <FileText size={12} className={v.active ? "text-primary" : "text-muted-foreground"} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${v.active ? "text-primary" : "text-foreground"}`}>{v.name}</p>
                                <p className="text-[11px] text-muted-foreground">{v.date}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${v.score >= 85 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600"}`}>{v.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </>
    )
}