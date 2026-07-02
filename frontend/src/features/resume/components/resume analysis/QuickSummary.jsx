import { Sparkles } from "lucide-react";

export default function QuickSummary({ analysisResult }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div className="space-y-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Quick Summary
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Strengths Identified:</span>
            <span className="text-emerald-500 font-bold">
              {analysisResult.strengths?.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Weaknesses Found:</span>
            <span className="text-red-500 font-bold">
              {analysisResult.weaknesses?.length || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Missing Sections:</span>
            <span className="text-amber-500 font-bold">
              {analysisResult.missing_sections?.length || 0}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-2.5 text-xs text-primary font-medium">
        <Sparkles size={14} className="shrink-0" />
        <span>Scroll down to improve sections with AI instantly!</span>
      </div>
    </div>
  );
}
