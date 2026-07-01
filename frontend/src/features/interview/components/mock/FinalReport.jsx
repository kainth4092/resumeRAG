import {
  Trophy,
  Clock,
  Star,
  Sparkles,
  BookOpen,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  HelpCircle,
} from "lucide-react";

export function FinalReport({ report, onRetake }) {
  const {
    interview_type,
    created_at,
    duration,
    overall_score,
    overall_grade,
    questions_attempted,
    performance_summary,
    answers = [],
  } = report;

  // Calculate averages from answers array
  const getAverage = (key) => {
    if (answers.length === 0) return 0;
    const sum = answers.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return Math.round(sum / answers.length);
  };

  const avgComm = getAverage("communication_score") || overall_score;
  const avgTech = getAverage("technical_score") || overall_score;
  const avgConf = getAverage("confidence_score") || overall_score;
  const avgClarity = getAverage("clarity_score") || overall_score;
  const avgGrammar = getAverage("grammar_score") || overall_score;

  const strongestTopic = interview_type || "General";
  const weakestTopic = avgTech < 75 ? "Technical Deep-dive" : "STAR Structure";

  const allStrengths = [];
  const allWeaknesses = [];
  const allImprovements = [];

  answers.forEach((ans) => {
    if (ans.strengths) allStrengths.push(...ans.strengths);
    if (ans.weaknesses) allWeaknesses.push(...ans.weaknesses);
    if (ans.improvements) allImprovements.push(...ans.improvements);
  });

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 4);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 4);
  const uniqueImprovements = [...new Set(allImprovements)].slice(0, 4);

  // Formatting date & duration
  const dateStr = created_at
    ? new Date(created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  const formatDuration = (secs) => {
    if (!secs) return "0s";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`;
  };

  // Helper to color overall score badge
  const overallScoreColor = (score) => {
    if (score >= 80)
      return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60)
      return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    return "text-red-600 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
            Mock Interview Assessment
          </span>
          <h2 className="text-xl font-bold text-foreground mt-2">
            {interview_type} Report
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <span>Completed on {dateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatDuration(duration)} duration
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ClipboardList size={11} />{" "}
              {questions_attempted || answers.length} Questions Attempted
            </span>
          </p>
        </div>

        <button
          onClick={onRetake}
          className="h-10 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={13} /> Retake Interview
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score & Grade Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="relative w-28 h-28 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-primary leading-none">
              {overall_grade || "B"}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground mt-1">
              Score: {overall_score}%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">
              Overall Performance Grade
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
              {performance_summary ||
                "Successfully completed the simulated session."}
            </p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-foreground">
            Core Interview Metrics
          </h4>
          <div className="space-y-3.5">
            {[
              { label: "Technical Knowledge", val: avgTech },
              { label: "Communication Skill", val: avgComm },
              { label: "Confidence & Pitch", val: avgConf },
              { label: "Clarity & Structure", val: avgClarity },
              { label: "Grammar & Accuracy", val: avgGrammar },
            ].map((metric, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="text-foreground">{metric.val}%</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${metric.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakest/Strongest highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Trophy size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Strongest Topic
            </h4>
            <p className="text-sm font-semibold text-emerald-600 mt-1">
              {strongestTopic}
            </p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Weakest Topic</h4>
            <p className="text-sm font-semibold text-amber-600 mt-1">
              {weakestTopic}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Question-by-Question Review
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Review each response, individual score metrics, and ideal model
            answers.
          </p>
        </div>

        <div className="space-y-5">
          {answers.map((ans, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-[10px] font-bold text-muted-foreground">
                  QUESTION {index + 1}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${overallScoreColor(ans.overall_score || 0)}`}
                >
                  {ans.overall_score || 0}% Score
                </span>
              </div>

              <h4 className="text-xs font-bold text-foreground">
                {ans.question_text}
              </h4>

              <div className="bg-muted/40 border border-border rounded-xl p-4 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-bold block mb-1 text-foreground">
                  Your Answer ({ans.answer_duration || 0}s):
                </span>
                "{ans.transcript || "Skipped question."}"
              </div>

              {/* Answer Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ans.strengths && ans.strengths.length > 0 && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 block">
                      STRENGTHS
                    </span>
                    <ul className="text-[10px] text-muted-foreground list-disc pl-3.5 space-y-1">
                      {ans.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ans.improvements && ans.improvements.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 block">
                      IMPROVEMENTS
                    </span>
                    <ul className="text-[10px] text-muted-foreground list-disc pl-3.5 space-y-1">
                      {ans.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {ans.ideal_answer && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-bold block mb-1 text-primary">
                    Suggested Ideal Answer:
                  </span>
                  {ans.ideal_answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
