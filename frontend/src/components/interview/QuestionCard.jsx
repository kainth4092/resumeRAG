import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Bookmark, Lightbulb, CheckCircle2, Play, RefreshCw, Loader2, Award, BookOpen } from "lucide-react";
import { DIFF_CFG } from "../../data/interviewConstants";
import EvaluationPanel from "./EvaluationPanel";

export default function QuestionCard({
    q,
    idx,
    onUpdateQuestionLocal,
    handleToggleBookmark,
    handleEvaluateAnswer,
}) {
    const [isOpen, setIsOpen] = useState(idx === 0);
    const [localAnswer, setLocalAnswer] = useState(q.user_answer || "");
    const [showTip, setShowTip] = useState(false);
    const [showSample, setShowSample] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState(null);

    // Keep localAnswer in sync if q.user_answer changes from hook (e.g. session load)
    useEffect(() => {
        setLocalAnswer(q.user_answer || "");
    }, [q.user_answer]);

    const diff = DIFF_CFG[q.difficulty] || DIFF_CFG["Medium"];

    const getTipContent = (tip) => {
        if (!tip) return "";
        if (typeof tip === "string") return tip;
        return tip.content || tip.title || "";
    };

    const getSampleAnswer = (ans) => {
        if (!ans) return "";
        if (typeof ans === "string") return ans;
        return ans.sample_answer || ans.answer || "";
    };

    const submitAnswer = async () => {
        if (!localAnswer.trim()) return;
        setError(null);
        setEvaluating(true);
        try {
            await handleEvaluateAnswer(q.id, localAnswer);
        } catch (err) {
            setError(err.response?.data?.detail || "Evaluation failed. Please try again.");
        } finally {
            setEvaluating(false);
        }
    };

    const resetAnswer = () => {
        setLocalAnswer("");
        onUpdateQuestionLocal(q.id, { answered: false, user_answer: "", evaluation: null });
        setError(null);
        setShowSample(false);
    };

    return (
        <div
            id={`q-${q.id}`}
            className={`bg-card border rounded-2xl transition-all duration-300 ${
                isOpen
                    ? "border-primary/20 shadow-[var(--shadow-md)]"
                    : "border-border hover:border-primary/10 hover:shadow-[var(--shadow-sm)]"
            }`}
        >
            {/* Header / Click to toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-start gap-4 p-5 cursor-pointer select-none"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                            Q{idx + 1}
                        </span>
                        <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                                color: diff.color,
                                backgroundColor: diff.bg,
                                border: `1px solid ${diff.border}`,
                            }}
                        >
                            {q.difficulty}
                        </span>
                        {q.answered && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded-full border border-emerald-500/15">
                                <CheckCircle2 size={10} /> Answered
                            </span>
                        )}
                        {q.evaluation && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15">
                                <Award size={10} /> Score: {q.evaluation.overall}%
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-relaxed">
                        {q.question}
                    </h3>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                            q.bookmarked
                                ? "bg-amber-500/8 border-amber-500/30 text-amber-500"
                                : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        <Bookmark size={13} className={q.bookmarked ? "fill-amber-500" : ""} />
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
                    >
                        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                </div>
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-border/50 space-y-4">
                    {/* Tip Section */}
                    {getTipContent(q.tip) && (
                        <div>
                            <button
                                onClick={() => setShowTip(!showTip)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                                <Lightbulb size={12} />
                                {showTip ? "Hide Interviewer Tip" : "Show Interviewer Tip"}
                            </button>
                            {showTip && (
                                <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                    {getTipContent(q.tip)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Editor / Textarea */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Your Response
                        </label>
                        <textarea
                            value={localAnswer}
                            onChange={e => setLocalAnswer(e.target.value)}
                            disabled={q.answered || evaluating}
                            placeholder="Type your response here... (Star method recommended: Situation, Task, Action, Result)"
                            rows={4}
                            className="w-full p-4 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-75 transition-all leading-relaxed"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {!q.answered ? (
                            <button
                                onClick={submitAnswer}
                                disabled={evaluating || !localAnswer.trim()}
                                className="flex items-center gap-2 px-4 h-10 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                            >
                                {evaluating ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" /> Evaluating…
                                    </>
                                ) : (
                                    <>
                                        <Play size={12} /> Submit Response
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={resetAnswer}
                                className="flex items-center gap-2 px-4 h-10 border border-border text-foreground rounded-xl text-xs font-semibold hover:bg-muted transition-all"
                            >
                                <RefreshCw size={12} /> Try Again
                            </button>
                        )}

                        {getSampleAnswer(q.answer) && (
                            <button
                                onClick={() => setShowSample(!showSample)}
                                className={`flex items-center gap-2 px-4 h-10 border rounded-xl text-xs font-semibold transition-all ${
                                    showSample
                                        ? "bg-primary/5 border-primary/25 text-primary"
                                        : "border-border text-foreground hover:bg-muted"
                                }`}
                            >
                                <BookOpen size={12} />
                                {showSample ? "Hide Model Answer" : "Model Answer"}
                            </button>
                        )}
                    </div>

                    {/* Model Answer Panel */}
                    {showSample && getSampleAnswer(q.answer) && (
                        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Model Answer
                            </p>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                                {getSampleAnswer(q.answer)}
                            </p>
                            {q.answer.duration && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Target duration: {q.answer.duration}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Key points and mistakes */}
                    {isOpen && (q.key_points?.length > 0 || q.common_mistakes?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {q.key_points?.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Key points to hit
                                    </p>
                                    <ul className="space-y-1">
                                        {q.key_points.map((p, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-2" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {q.common_mistakes?.length > 0 && (
                                <div>
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Common pitfalls
                                    </p>
                                    <ul className="space-y-1">
                                        {q.common_mistakes.map((p, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Evaluation Results */}
                    {q.answered && q.evaluation && (
                        <EvaluationPanel
                            ev={q.evaluation}
                            onDismiss={() => onUpdateQuestionLocal(q.id, { evaluation: null })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
