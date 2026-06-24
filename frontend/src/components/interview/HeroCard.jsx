import { FileText } from "lucide-react";

export default function HeroCard({ session }) {
    if (!session) return null;

    const logoText = session.companyLogo || (session.company ? session.company[0].toUpperCase() : "P");;

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:shadow-(--shadow-sm) transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md shadow-primary/10 shrink-0"
                        style={{ backgroundColor: session.logoColor || "#635BFF" }}
                    >
                        {logoText}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold text-foreground tracking-tight">{session.company || "Company"}</h2>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground mt-0.5">{session.role || "Role"}</p>
                        <div className="flex items-center gap-x-3 gap-y-1 mt-2.5 flex-wrap text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">
                                <FileText size={12} /> {session.resumeUsed || "Selected Resume"}
                            </span>

                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">

                    <div className="flex items-center gap-1 px-4 py-3 bg-muted/40 border border-border rounded-xl">
                        {[
                            { val: session.questionCount || 0, label: "Questions", color: "text-primary" },
                            { val: session.difficulty?.easy || 0, label: "Easy", color: "text-emerald-500" },
                            { val: session.difficulty?.medium || 0, label: "Medium", color: "text-amber-500" },
                            { val: session.difficulty?.hard || 0, label: "Hard", color: "text-red-500" },
                        ].map((m, i) => (
                            <div key={m.label} className="flex items-center">
                                {i > 0 && <span className="text-muted-foreground/30 text-xs mx-2">|</span>}
                                <div className="text-center min-w-10">
                                    <p className={`text-base font-bold leading-none ${m.color}`}>{m.val}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-none">{m.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}