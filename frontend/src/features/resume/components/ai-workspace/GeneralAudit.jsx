import { ShieldCheck, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import AIImprover from "./AIImprover";

export default function GeneralAudit({
  analysisResult,
  analyzing,
  analysisStep,
  onRunAnalysis,
  improvingSection,
  setImprovingSection,
  improvedText,
  setImprovedText,
  copiedSection,
  customSectionContent,
  setCustomSectionContent,
  triggerSectionImprovement,
  copyToClipboard,
  improving,
}) {
  const score = analysisResult?.ats_score || analysisResult?.score || 0;

  const getScoreColor = (s) => {
    if (s >= 80) return "text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (s >= 60) return "text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 stroke-red-500 bg-red-500/10 border-red-500/20";
  };


  return (
    <div className="space-y-6 text-left">
      {/* Run Scan Card */}
      {!analysisResult && !analyzing && (
        <div className="bg-card border border-border/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={26} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-sm text-foreground">ATS Resume Health Scan</h3>
            <p className="text-xs text-muted-foreground">
              Run a complete diagnostic audit of your resume layout, headings, grammatical quality, and section presence.
            </p>
          </div>
          <button
            onClick={onRunAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-primary/10"
          >
            <Sparkles size={14} />
            Scan Resume Health
          </button>
        </div>
      )}

      {/* Analyzing State */}
      {analyzing && (
        <div className="bg-card border border-border/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs animate-in fade-in duration-200">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">Analyzing Resume...</h3>
            <p className="text-xs text-primary font-semibold animate-pulse">{analysisStep}</p>
          </div>
        </div>
      )}

      {/* Analysis Result Dashboard */}
      {analysisResult && !analyzing && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Circular Score Dial */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ATS SCORE</span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-muted" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ${
                      score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-extrabold text-foreground leading-none">{score}</span>
                  <span className="text-[8px] font-bold text-muted-foreground/80 mt-0.5">/100</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getScoreColor(score)}`}>
                {score >= 80 ? "Excellent" : score >= 60 ? "Needs Improvement" : "Critical"}
              </span>
            </div>

            {/* Missing Sections */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">MISSING SECTIONS</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Crucial sections that recruiters and ATS scanners look for.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {analysisResult.missing_sections?.length > 0 ? (
                  analysisResult.missing_sections.map((sect, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20"
                    >
                      {sect}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={10} /> No missing sections!
                  </span>
                )}
              </div>
            </div>

            {/* Quick Diagnostic Overview */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">DIAGNOSTIC SUMMARY</span>
                <p className="text-[11px] text-foreground font-semibold">
                  {analysisResult.summary || "Your resume has been scanned. Below are specific highlights of structural quality, word variety, and layout standards."}
                </p>
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-3 border-t border-border pt-2 flex items-center justify-between">
                <span>Formatting: {analysisResult.formatting_status || (score >= 70 ? "Standard Passed" : "Needs Fixes")}</span>
                <span>Grammar: {analysisResult.grammar_status || "Clean"}</span>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
                KEY STRENGTHS
              </span>
              <div className="space-y-2">
                {analysisResult.strengths?.length > 0 ? (
                  analysisResult.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground font-medium">No strengths analyzed.</p>
                )}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-1.5">
                AREAS FOR IMPROVEMENT
              </span>
              <div className="space-y-2">
                {analysisResult.weaknesses?.length > 0 ? (
                  analysisResult.weaknesses.map((weak, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                      <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <span>{weak}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-foreground font-medium">No improvements needed!</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Improver */}
          <AIImprover
            improvingSection={improvingSection}
            setImprovingSection={setImprovingSection}
            improvedText={improvedText}
            setImprovedText={setImprovedText}
            copiedSection={copiedSection}
            customSectionContent={customSectionContent}
            setCustomSectionContent={setCustomSectionContent}
            triggerSectionImprovement={triggerSectionImprovement}
            copyToClipboard={copyToClipboard}
            improving={improving}
          />
        </div>
      )}
    </div>
  );
}
