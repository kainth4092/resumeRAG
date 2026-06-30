import { ArrowLeft, Check, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function ChallengeReview({
  step,
  setStep,
  questions,
  currentIdx,
  setCurrentIdx,
  userAnswers,
  onBackToPrep,
}) {


  return (
    <>
      {step === "review" && questions.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("result")}
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <h3 className="text-sm font-bold text-foreground">Review Mode</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Inspect correct and incorrect options</p>
              </div>
            </div>

            <button
              onClick={onBackToPrep}
              className="h-8 px-4 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Finish Review
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 shrink-0">
                  Question {currentIdx + 1} of 20
                </span>

                {(() => {
                  const userSel = userAnswers[currentIdx];
                  const corrLetter = questions[currentIdx].correct_option;
                  if (!userSel) {
                    return (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        Skipped
                      </span>
                    );
                  }
                  if (userSel === corrLetter) {
                    return (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Correct
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <XCircle size={10} /> Incorrect
                    </span>
                  );
                })()}
              </div>

              <h4 className="text-base font-bold text-foreground leading-snug">
                {questions[currentIdx].question}
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {questions[currentIdx].options.map((opt, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  const userSel = userAnswers[currentIdx];
                  const corrLetter = questions[currentIdx].correct_option;

                  const isCorrectOption = letter === corrLetter;
                  const isUserSelected = letter === userSel;

                  let borderClass = "border-border";
                  let bgClass = "bg-card";

                  if (isCorrectOption) {
                    borderClass = "border-emerald-500 bg-emerald-500/5";
                  } else if (isUserSelected) {
                    borderClass = "border-destructive bg-destructive/5";
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left ${borderClass} ${bgClass}`}
                    >
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${isCorrectOption
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isUserSelected
                          ? "bg-destructive border-destructive text-white"
                          : "border-border text-muted-foreground bg-muted/30"
                        }`}>
                        {letter}
                      </div>
                      <div className="flex-1 text-xs font-semibold text-foreground leading-relaxed pt-0.5">
                        {opt}
                      </div>
                    </div>
                  );
                })}
              </div>

              {questions[currentIdx].explanation && (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-primary">Explanation</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {questions[currentIdx].explanation}
                  </p>
                </div>
              )}

              {(() => {
                const userSel = userAnswers[currentIdx];
                const corrLetter = questions[currentIdx].correct_option;
                const distractorExplanations = questions[currentIdx].distractor_explanations;
                if (userSel && userSel !== corrLetter && distractorExplanations && distractorExplanations[userSel]) {
                  return (
                    <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-5 space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-destructive">Why your selection ({userSel}) is incorrect</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {distractorExplanations[userSel]}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 h-9 px-4 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  disabled={currentIdx === 19}
                  className="flex items-center gap-1.5 h-9 px-4 bg-muted hover:bg-muted/85 text-foreground border border-border rounded-xl text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Question Navigator
              </h4>

              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isCurrent = idx === currentIdx;
                  const userSel = userAnswers[idx];
                  const corrLetter = questions[idx].correct_option;

                  let btnStyle;

                  if (!userSel) {
                    btnStyle = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                  } else if (userSel === corrLetter) {
                    btnStyle = "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 font-semibold";
                  } else {
                    btnStyle = "bg-destructive/10 text-destructive border-destructive/25 font-semibold";
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

              <div className="border-t border-border pt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/25" />
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-destructive/10 border border-destructive/25" />
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/25" />
                  <span>Skipped</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}</>
  );
}
