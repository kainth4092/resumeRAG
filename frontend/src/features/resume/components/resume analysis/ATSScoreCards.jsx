export default function ATSScoreCards({ analysisResult, getScoreColor }) {
  if (!analysisResult) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
      <div className="absolute top-3 left-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Overall ATS Score
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center mt-3">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-muted fill-transparent"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`fill-transparent transition-all duration-1000 ${
              analysisResult.ats_score >= 80
                ? "stroke-emerald-500"
                : analysisResult.ats_score >= 60
                  ? "stroke-amber-500"
                  : "stroke-red-500"
            }`}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analysisResult.ats_score || 0) / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-3xl font-extrabold text-foreground">
          {analysisResult.ats_score || 0}
        </span>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor ? getScoreColor(analysisResult.ats_score) : ""}`}
      >
        {analysisResult.ats_score >= 80
          ? "ATS Optimized"
          : analysisResult.ats_score >= 60
            ? "Needs Review"
            : "Poor ATS Fit"}
      </div>
    </div>
  );
}
