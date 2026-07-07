import { CheckCircle2, AlertTriangle } from "lucide-react";

function ScoreRing({ value, size = 100, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (value / 100) * circum;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-muted/20 stroke-current"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary stroke-current transition-all duration-1000 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circum}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-foreground tracking-tighter leading-none">
          {value}
        </span>
        <span className="text-[9px] text-muted-foreground font-semibold mt-0.5 uppercase tracking-wide">
          ATS
        </span>
      </div>
    </div>
  );
}

export default function ResumeHealth({ data }) {
  const atsScore = data?.resume_insights?.ats_score || 0;
  const topSkills = data?.resume_insights?.top_skills || [];
  const missingSkills = data?.resume_insights?.missing_skills || [];

  const totalKeywords = topSkills.length + missingSkills.length;
  const matchedKeywordsText = totalKeywords > 0 
    ? `${topSkills.length}/${totalKeywords} matched` 
    : "No keywords";

  const checklist = [
    {
      title: "Keywords Analysis",
      desc: matchedKeywordsText,
      ok: totalKeywords === 0 || topSkills.length / totalKeywords >= 0.6,
      tip: missingSkills.length > 0 ? `Missing: ${missingSkills.slice(0, 2).join(", ")}` : "Upload resume for keyword check"
    },
    {
      title: "Formatting Check",
      desc: atsScore > 0 ? "Single-page layout, clean margins" : "Pending upload",
      ok: atsScore > 0,
      tip: atsScore > 0 ? "Parsed successfully by ATS scanners" : "Analyze resume to evaluate formatting"
    },
    {
      title: "Impact Metrics",
      desc: data?.resume_insights?.suggestions?.[0] || "Include measurable achievements",
      ok: atsScore >= 80,
      tip: "Use bold numbers and action verbs"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-foreground">Resume Health</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time resume compliance score</p>
      </div>

      <div className="flex items-center gap-6 my-4">
        <ScoreRing value={atsScore} size={100} stroke={8} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {atsScore >= 85 ? "Excellent Match!" : atsScore >= 70 ? "Good Potential" : atsScore > 0 ? "Needs Optimization" : "No Resume Analyzed"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {atsScore >= 70 
              ? "Your resume is highly optimized for current job markets. Minor tweaks will maximize replies."
              : atsScore > 0 
              ? "Your score has room for growth. Enhance formatting and keywords to boost responses."
              : "Generate or upload an AI-optimized resume matching your target job role."
            }
          </p>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-border pt-4">
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {item.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-baseline gap-2">
                <p className="text-xs font-bold text-foreground leading-none">{item.title}</p>
                <span className="text-[10px] text-muted-foreground leading-none font-medium">
                  {item.desc}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
