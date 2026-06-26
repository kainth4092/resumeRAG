import { Sparkles } from "lucide-react";

export default function AISuggestions({ analysis }) {
    const suggestions = analysis?.suggestions || [];

    const typedSuggestions = suggestions.map((text, idx) => {
        let type;
        const lower = text.toLowerCase();
        if (
            lower.includes("missing") ||
            lower.includes("critical") ||
            lower.includes("must") ||
            lower.includes("add") ||
            lower.includes("lacks")
        ) {
            type = "critical";
        } else if (
            lower.includes("strong") ||
            lower.includes("good") ||
            lower.includes("great") ||
            lower.includes("detected") ||
            lower.includes("match")
        ) {
            type = "success";
        } else {
            const types = ["critical", "warning", "warning", "critical", "success"];
            type = types[idx % types.length];
        }
        return { text, type };
    });

    return (
        <>
            {analysis && (
                <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={15} className="text-primary" />
                        <h3 className="text-foreground">AI Suggestions</h3>
                    </div>
                    <div className="space-y-2.5">
                        {typedSuggestions.map((s, i) => {
                            const cfg = {
                                critical: "border-red-500/25 bg-red-500/5 text-red-500",
                                warning: "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400",
                                success: "border-emerald-500/25 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
                            }[s.type];
                            return (
                                <div key={i} className={`p-3 rounded-xl border text-xs leading-relaxed ${cfg}`}>{s.text}</div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    )
}