import {
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";

export default function JobTailor({
  jd,
  setJd,
  analysis,
  analyzing,
  onAnalyze,
  onGenerate,
  generating,
}) {
  const matchScore = analysis?.ats_score || 0;

  return (
    <div className="space-y-6 text-left">
      {/* Job Description Paste & Action */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Target className="text-primary fill-primary/10" size={15} />
            Job Description Matcher
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Paste a target job description. We'll identify skills gaps and
            optimize your resume keywords.
          </p>
        </div>

        <div className="space-y-3">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={analyzing || generating}
            placeholder="Paste target job description here..."
            className="w-full h-44 rounded-xl border border-border bg-card p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary resize-none font-medium"
          />

          <div className="flex justify-end">
            <button
              onClick={onAnalyze}
              disabled={!jd.trim() || analyzing || generating}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Analyzing Match...</span>
                </>
              ) : (
                <>
                  <BarChart3 size={13} />
                  <span>Analyze Job Match</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Match Results Dashboard */}
      {analysis && !analyzing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Circular Match score */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                JOB MATCH SCORE
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ${
                      matchScore >= 80
                        ? "stroke-emerald-500"
                        : matchScore >= 60
                          ? "stroke-amber-500"
                          : "stroke-red-500"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * matchScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-extrabold text-foreground leading-none">
                    {matchScore}%
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground/80 mt-0.5">
                    Match
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  matchScore >= 80
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : matchScore >= 60
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      : "text-red-500 bg-red-500/10 border-red-500/20"
                }`}
              >
                {matchScore >= 80
                  ? "High Match"
                  : matchScore >= 60
                    ? "Moderate Match"
                    : "Low Match"}
              </span>
            </div>

            {/* Keyword Audit */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-3.5 text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
                KEYWORD GAP ANALYSIS
              </span>
              <div className="space-y-3">
                {/* Matched */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Matched Keywords
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.matched_keywords?.length > 0 ? (
                      analysis.matched_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-muted-foreground font-medium">
                        No matches found.
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                    <XCircle size={10} className="text-amber-500" /> Missing
                    Keywords
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.missing_keywords?.length > 0 ? (
                      analysis.missing_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-emerald-500 font-medium">
                        None! All important keywords are present.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Heatmap & AI Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Heatmap */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
                SECTION RELEVANCE HEATMAP
              </span>
              <div className="space-y-2">
                {analysis.heatmap &&
                  Object.entries(analysis.heatmap).map(([section, val]) => (
                    <div key={section} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-foreground">
                        <span className="capitalize">
                          {section.replace("_", " ")}
                        </span>
                        <span>{val}%</span>
                      </div>
                      <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            val >= 80
                              ? "bg-emerald-500"
                              : val >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* AI Custom Recommendations */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
                AI ACTION PLANS
              </span>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {analysis.suggestions?.length > 0 ? (
                  analysis.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-foreground font-medium leading-relaxed"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>{sug}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Your resume is perfectly aligned.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Generate Resume Action Banner */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-left space-y-1">
              <h4 className="font-bold text-xs text-foreground">
                Tailor Resume with AI
              </h4>
              <p className="text-[10px] text-muted-foreground max-w-md">
                We'll rewrite bullet points, address skills gaps, and
                restructure phrasing to target this job description.
              </p>
            </div>
            <button
              onClick={onGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer shadow-sm shadow-primary/20 shrink-0"
            >
              {generating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Optimizing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Tailored Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
