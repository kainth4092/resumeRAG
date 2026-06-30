import { Timer, ChevronLeft, ChevronRight } from "lucide-react";

export default function ChallengeTest({
  step,
  questions,
  currentIdx,
  setCurrentIdx,
  userAnswers,
  selectOption,
  timeLeft,
  isSubmitting,
  submitTest,
  getTimerColorClass,
  formatTime,
}) {
  return (
    <>
      {step === "test" && questions.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                TC
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Time Capsule</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">20 Questions MCQ Challenge</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-muted-foreground" />
                <span className={`text-sm ${getTimerColorClass()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={submitTest}
                disabled={isSubmitting}
                className="h-8 px-4 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 shrink-0">
                  Question {currentIdx + 1} of 20
                </span>
                {questions[currentIdx].skill && (
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                    {questions[currentIdx].skill}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-foreground leading-snug">
                {questions[currentIdx].question}
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {questions[currentIdx].options.map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  const isSelected = userAnswers[currentIdx] === letter;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectOption(letter)}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${isSelected
                        ? "bg-primary/5 border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/30 hover:bg-muted/10"
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-border text-muted-foreground bg-muted/30"
                        }`}>
                        {letter}
                      </div>
                      <span className="text-xs font-semibold text-foreground leading-relaxed pt-0.5">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 h-9 px-4 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <button
                  onClick={() => {
                    if (currentIdx < 19) {
                      setCurrentIdx(prev => prev + 1);
                    }
                  }}
                  disabled={currentIdx === 19}
                  className="flex items-center gap-1.5 h-9 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Skip / Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Question Navigator Column */}
            <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = userAnswers[idx] !== undefined;

                  let btnStyle = "border-border text-muted-foreground hover:border-primary/45";
                  if (isAnswered) {
                    btnStyle = "bg-primary/10 text-primary border-primary/25 font-bold";
                  }
                  if (isCurrent) {
                    btnStyle = "bg-primary text-white border-primary font-bold shadow-sm";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-xl border flex items-center justify-center text-xs transition-all cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 flex gap-4 text-[10px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-primary" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-primary/15 border border-primary/25" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded border border-border bg-card" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
