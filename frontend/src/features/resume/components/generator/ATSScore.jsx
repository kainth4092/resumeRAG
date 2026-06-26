import CircularScore from "./CircularScore";

export default function ATSScore({ analysis }) {
    const getGrade = (score) => {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B+";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        return "D";
    };

    const formattingScore = analysis?.heatmap?.contact_info ?? 0;

    const matched = analysis?.matched_keywords?.length || 0;
    const missing = analysis?.missing_keywords?.length || 0;
    const total = matched + missing;
    const keywordRate = total > 0 ? (matched / total) * 100 : 0;

    const lengthScore = analysis?.heatmap?.summary ?? 0;

    const grades = [
        { l: "Formatting", v: getGrade(formattingScore) },
        { l: "Keywords", v: getGrade(keywordRate) },
        { l: "Length", v: getGrade(lengthScore) },
    ];

    return (
        <>
            {analysis && (
                <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center">
                    <h3 className="text-foreground mb-4 self-start">ATS Score</h3>
                    <CircularScore score={analysis?.ats_score || 0} />
                    <div className="w-full mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
                        {grades.map(m => (
                            <div key={m.l}>
                                <p className="text-lg font-bold text-foreground">{m.v}</p>
                                <p className="text-[11px] text-muted-foreground">{m.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}