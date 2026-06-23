import { useState } from "react";
import {
  Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Clock,
  RefreshCw, Sparkles,
} from "lucide-react";
import { DIFF_CFG, CAT_CFG } from "../../data/interviewConstants";

const formatDuration = (val) => {
  if (!val) return "3 min";
  const str = String(val).toLowerCase();
  if (str.includes("min")) return val;
  return `${val} min`;
};

export default function QuestionCard({
  question,
  index,
  onToggleBookmark,
  loadingQuestionId,
  onExpand,
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
  const difficulty = DIFF_CFG[question.difficulty] || DIFF_CFG.Medium;
  const categoryCfg = CAT_CFG[question.category] || { color: "#7C3AED", bg: "#f5f3ff" };
  const CategoryIcon = categoryCfg.icon;

  const sampleAnswerText = toText(question.sampleAnswer);

  const handleToggleOpen = () => {
    const nextOpen = !open;
    if (nextOpen && !question.details_generated) {
      if (loadingQuestionId) {
        return;
      }
      onExpand();
    }
    setOpen(nextOpen);
  };

  return (
    <div id={`q-${question.id}`}
      className={`bg-card border rounded-2xl transition-all duration-200 ${open ? "border-primary/25 shadow-[var(--shadow-md)]" : "border-border hover:border-primary/20 hover:shadow-[var(--shadow-sm)]"}`}>
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-start gap-3.5 p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-2xl"
        onClick={handleToggleOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleToggleOpen();
          }
        }}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 transition-colors ${open ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-md font-medium text-foreground leading-relaxed">
            {question.question}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: difficulty.color, backgroundColor: difficulty.bg, border: `1px solid ${difficulty.border}` }}>
              {question.difficulty}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: categoryCfg.color, backgroundColor: categoryCfg.bg, border: `1px solid ${categoryCfg.color}30` }}>
              {CategoryIcon && <CategoryIcon size={10} />}
              {question.category}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={10} />{formatDuration(question.estimatedMins)}
            </span>
            {question.experience_level && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {question.experience_level}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <button onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark(question.id);
          }}
            className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all hover:scale-110 ${question.bookmarked ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}>
            {question.bookmarked ?
              <BookmarkCheck size={14} /> :
              <Bookmark size={14} />
            }
          </button>
          {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 pt-4 border-t border-border">
          {loadingQuestionId === question.id ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <RefreshCw size={16} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Generating answer...</p>
            </div>
          ) : (
            sampleAnswerText && (
              <div className="bg-card border border-border rounded-xl p-4 animate-in fade-in-50 duration-150">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles size={10} />
                  AI Sample Answer
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {sampleAnswerText}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
