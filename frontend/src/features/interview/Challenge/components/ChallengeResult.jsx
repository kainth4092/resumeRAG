import { Award, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";

export default function ChallengeResult({ step, result, onBackToPrep, onReviewAnswers }) {
  return (
    <>
      {step === "result" && result && (
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
              <Award size={32} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Challenge Completed!</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Here are your score metrics and study guidance.</p>
            </div>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score</p>
              <p className="text-xl font-black text-foreground">{result.score} / 20</p>
            </div>
            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy</p>
              <p className="text-xl font-black text-foreground">{result.accuracy}%</p>
            </div>
            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wrong / Skipped</p>
              <p className="text-xl font-black text-foreground">
                <span className="text-destructive font-black">{result.wrong}</span> / <span className="text-muted-foreground font-black">{result.skipped}</span>
              </p>
            </div>
            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time Taken</p>
              <p className="text-xl font-black text-foreground">{result.time_taken}</p>
            </div>
          </div>

          {/* Topics to Revise */}
          {result.topics_to_revise && result.topics_to_revise.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={18} />
                <h4 className="text-xs font-bold uppercase tracking-wider">Topics to Revise</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                We detected weaknesses in these domains based on your incorrect answers. Consider studying these concepts:
              </p>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {result.topics_to_revise.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-bold"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(!result.topics_to_revise || result.topics_to_revise.length === 0) && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 text-center space-y-2">
              <div className="flex justify-center text-emerald-500 mb-1">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Perfect Score!</h4>
              <p className="text-xs text-muted-foreground">
                Spectacular work! You got 100% correct answers. You are fully ready for FAANG interviews.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
            <button
              onClick={onBackToPrep}
              className="flex-1 h-11 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Back to Interview Prep
            </button>
            <button
              onClick={onReviewAnswers}
              className="flex-1 h-11 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen size={13} /> Review Answers
            </button>
          </div>
        </div>
      )}
    </>
  );
}
