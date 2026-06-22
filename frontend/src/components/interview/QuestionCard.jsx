import { useEffect, useRef, useState } from "react";
import {
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Clock, Loader2, Mic,
  RefreshCw, Sparkles, Volume2,
} from "lucide-react";
import { DIFF_CFG } from "../../data/interviewConstants";
import EvaluationPanel from "./EvaluationPanel";

export default function QuestionCard({
  question,
  index,
  onUpdate,
  onToggleBookmark,
  onEvaluate,
}) {
  const toText = (value) => {
    if (typeof value === "string") return value;
    if (value == null) return "";
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(" ");
    if (typeof value === "object") {
      return toText(value.sample_answer ?? value.content ?? value.text ?? value.answer ?? value.value ?? "");
    }
    return String(value);
  };

  const [open, setOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showingSample, setShowingSample] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const difficulty = DIFF_CFG[question.difficulty] || DIFF_CFG.Medium;
  const tipText = toText(question.tip);
  const sampleAnswerText = toText(question.sampleAnswer);
  const keyConcepts = Array.isArray(question.keyConcepts) ? question.keyConcepts : [];
  const commonMistakes = Array.isArray(question.commonMistakes) ? question.commonMistakes : [];

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const evaluate = async () => {
    if (!question.answer.trim()) return;
    setEvaluating(true);
    setError("");
    try {
      await onEvaluate(question.id, question.answer);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice recording is not supported in this browser.");
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).slice(event.resultIndex).map((result) => result[0].transcript).join(" ");
      onUpdate({ answer: `${question.answer} ${transcript}`.trim() });
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => {
      setRecording(false);
      setError("Voice recording stopped. Please check microphone permission.");
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const speak = () => {
    window.speechSynthesis?.cancel();
    const text = showingSample && sampleAnswerText ? sampleAnswerText : question.question;
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <div id={`q-${question.id}`} className={`bg-card border rounded-2xl transition-all duration-200 ${open ? "border-primary/25 shadow-[var(--shadow-md)]" : "border-border hover:border-primary/20 hover:shadow-[var(--shadow-sm)]"}`}>
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-start gap-3.5 p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-2xl"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 transition-colors ${question.answered ? "bg-emerald-500 text-white" : open ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{question.answered ? "✓" : index + 1}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-relaxed">{question.question}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: difficulty.color, backgroundColor: difficulty.bg, border: `1px solid ${difficulty.border}` }}>{question.difficulty}</span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={10} />{question.estimatedMins} min</span>
            {question.evaluation && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: question.evaluation.overall >= 80 ? "#10b981" : question.evaluation.overall >= 65 ? "#f59e0b" : "#ef4444", backgroundColor: question.evaluation.overall >= 80 ? "#ecfdf5" : question.evaluation.overall >= 65 ? "#fffbeb" : "#fef2f2" }}>{question.evaluation.overall}/100</span>}
            {!open && tipText && <p className="text-[11px] text-muted-foreground/60 italic hidden sm:block">💡 {tipText.slice(0, 55)}…</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <button onClick={(event) => { event.stopPropagation(); onToggleBookmark(question.id); }} className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all hover:scale-110 ${question.bookmarked ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}>
            {question.bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-border space-y-4">
          {tipText && <div className="flex items-start gap-3 p-3.5 bg-primary/5 border border-primary/12 rounded-xl"><Sparkles size={13} className="text-primary mt-0.5 flex-shrink-0" /><div><p className="text-[10px] font-bold text-primary mb-0.5">AI Tip</p><p className="text-[11px] text-muted-foreground leading-relaxed">{tipText}</p></div></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Key Concepts</p><div className="flex flex-wrap gap-1.5">{keyConcepts.map((concept) => <span key={concept} className="text-[11px] px-2.5 py-1 bg-muted border border-border rounded-xl text-muted-foreground">{concept}</span>)}</div></div>
            <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Common Mistakes</p><ul className="space-y-1">{commonMistakes.map((mistake, itemIndex) => <li key={itemIndex} className="flex items-start gap-1.5 text-[11px] text-muted-foreground"><span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />{mistake}</li>)}</ul></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Your Answer</label>
              <div className="flex items-center gap-3">
                <button onClick={toggleRecording} className={`flex items-center gap-1 text-[11px] transition-colors ${recording ? "text-red-500" : "text-muted-foreground hover:text-primary"}`}><Mic size={11} /> {recording ? "Stop" : "Record"}</button>
                {question.answer && <button onClick={() => onUpdate({ answer: "" })} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Clear</button>}
              </div>
            </div>
            <textarea value={question.answer} onChange={(event) => onUpdate({ answer: event.target.value })} placeholder="Structure your answer using STAR: Situation → Task → Action → Result…" rows={5} className="w-full px-4 py-3 bg-input-background border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 resize-none transition-all" />
            <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground/60"><span>{question.answer.length} chars · {question.answer.split(/\s+/).filter(Boolean).length} words</span><span>Target: {question.estimatedMins * 120}–{question.estimatedMins * 160} words</span></div>
          </div>
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium">{error}</div>}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={evaluate} disabled={!question.answer.trim() || evaluating} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 transition-all shadow-sm shadow-primary/15">
              {evaluating ? <><Loader2 size={13} className="animate-spin" /> Evaluating…</> : <><Sparkles size={13} /> Evaluate Answer</>}
            </button>
            <button onClick={() => setShowingSample((value) => !value)} disabled={!sampleAnswerText} className="flex items-center gap-2 px-3.5 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-all"><RefreshCw size={13} /> {showingSample ? "Hide Answer" : "Sample Answer"}</button>
            <button onClick={speak} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"><Volume2 size={13} /> Voice</button>
          </div>
          {showingSample && sampleAnswerText && <div className="bg-card border border-border rounded-xl p-4"><p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5"><Sparkles size={10} /> Sample Answer</p><p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{sampleAnswerText}</p></div>}
          {question.evaluation && <EvaluationPanel evaluation={question.evaluation} onDismiss={() => onUpdate({ evaluation: null })} />}
        </div>
      )}
    </div>
  );
}
