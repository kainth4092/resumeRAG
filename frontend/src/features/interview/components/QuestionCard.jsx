import { useState, useEffect, memo } from "react";
import {
  Bookmark, BookmarkCheck, ChevronDown, Sparkles, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import { CAT_CFG, DIFF_CFG } from "../../../data/interviewConstants";
import { useAuth } from "../../../context/AuthContext";

function Prose({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <div className="text-sm text-foreground/90 space-y-2.5 leading-relaxed font-normal">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;


        if (trimmed.startsWith("###")) {
          return <h4 key={i} className="text-sm font-bold text-foreground mt-4 mb-2">{trimmed.replace(/^###\s*/, "")}</h4>;
        }
        if (trimmed.startsWith("##")) {
          return <h3 key={i} className="text-base font-bold text-foreground mt-5 mb-2.5">{trimmed.replace(/^##\s*/, "")}</h3>;
        }

        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const text = trimmed.replace(/^[-*]\s*/, "");
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 my-1">
              <li className="text-muted-foreground">{parseInline(text)}</li>
            </ul>
          );
        }

        if (/^\d+\./.test(trimmed)) {
          const text = trimmed.replace(/^\d+\.\s*/, "");
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1 my-1">
              <li className="text-muted-foreground">{parseInline(text)}</li>
            </ol>
          );
        }

        return <p key={i} className="text-muted-foreground">{parseInline(trimmed)}</p>;
      })}
    </div>
  );
}

function parseInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, idx) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={idx} className="font-bold text-foreground">{p.slice(2, -2)}</strong>;
    }
    return p;
  });
}

function CodeBlocks({ content }) {
  if (!content) return null;

  const parts = content.split(/```/g);

  return (
    <div className="space-y-4">
      {parts.map((part, idx) => {
        const isCode = idx % 2 === 1;

        if (isCode) {
          const lines = part.split("\n");
          let lang = lines[0].trim();
          let code = part;
          if (lang && !lang.includes(" ") && lines.length > 1) {
            code = lines.slice(1).join("\n");
          } else {
            lang = "javascript";
          }

          return (
            <div key={idx} className="border border-border rounded-xl overflow-hidden my-3 bg-muted/30">

              <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{lang}</span>
              </div>

              <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed bg-[#0d1117] ">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        return <Prose key={idx} content={part} />;
      })}
    </div>
  );
}

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

export const QuestionCard = memo(function QuestionCard({
  question,
  index,
  onToggleBookmark,
  onEdit,
  onDelete,
  isInitiallyExpanded = false,
  onExpand,
  isLoading = false,
}) {
  const { user } = useAuth();
  const isCreatedByCurrentUser = user && question.created_by === user.id;

  const [open, setOpen] = useState(isInitiallyExpanded);

  useEffect(() => {
    if (isInitiallyExpanded) {
      setOpen(true);
      if (onExpand) {
        onExpand(question.id);
      }
    }
  }, [isInitiallyExpanded, onExpand, question.id]);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen && onExpand) {
      onExpand(question.id);
    }
  };
  const cat = CAT_CFG[question.category] || { icon: Sparkles, color: "#7C3AED", bg: "#f5f3ff" };
  const CatIcon = cat.icon;

  const diff = DIFF_CFG[question.difficulty] || { color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b28" };

  const sampleAnswerText = toText(question.sampleAnswer || question.answer);
  const readMins = question.estimatedMins || 3;

  const answerObj = typeof question.answer === "object" ? question.answer : null;
  const keyPoints = question.keyPoints || answerObj?.key_points || [];
  const commonMistakes = question.commonMistakes || answerObj?.common_mistakes || [];
  const followUps = question.followUps || answerObj?.follow_up_questions || [];

  return (
    <div
      id={`q-${question.id}`}
      className={`bg-card border rounded-2xl transition-all duration-200 ${open
        ? "border-primary/25 shadow-(--shadow-md)"
        : "border-border hover:border-primary/20 hover:shadow-(--shadow-sm)"
        }`}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex items-start gap-4 p-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-t-2xl select-none"
        onClick={handleToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
      >

        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 transition-colors ${open ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
        >
          {index + 1}
        </div>


        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {question.question}
          </p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">

            {question.skill && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {question.skill}
              </span>
            )}

            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ color: cat.color, backgroundColor: cat.bg }}
            >
              <CatIcon size={10} />
              {question.category}
            </span>

            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: diff.color, backgroundColor: diff.bg, border: `1px solid ${diff.border}` }}
            >
              {question.difficulty}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={10} />
              {readMins} min read
            </span>
          </div>
        </div>


        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(question.id);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95 ${question.bookmarked ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
              }`}
            title={question.bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {question.bookmarked ? <BookmarkCheck size={14} className="fill-amber-500 text-amber-500" /> : <Bookmark size={14} />}
          </button>
          <div
            className="w-6 h-6 flex items-center justify-center text-muted-foreground transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          >
            <ChevronDown size={15} />
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-border">
          <div className="p-5 space-y-5">

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">AI-Generated Answer</p>
                <p className="text-[11px] text-muted-foreground">Tailored to your resume · Stripe Senior Frontend Engineer</p>
              </div>
            </div>


            {isLoading ? (
              <div className="flex items-center gap-2.5 py-4 px-5 bg-primary/4 border border-primary/12 rounded-2xl text-xs text-muted-foreground animate-pulse">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Generating a personalized sample answer tailored to your resume...</span>
              </div>
            ) : sampleAnswerText ? (
              <div className="bg-linear-to-br from-primary/4 via-transparent to-transparent border border-primary/12 rounded-2xl p-5">
                <CodeBlocks content={sampleAnswerText} />
              </div>
            ) : null}

            {keyPoints.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={11} className="text-primary" /> Key Points to Cover
                </p>
                <div className="flex flex-wrap gap-2">
                  {keyPoints.map((kp) => (
                    <span
                      key={kp}
                      className="text-[12px] font-semibold px-3 py-1.5 bg-primary/8 text-primary border border-primary/15 rounded-xl"
                    >
                      {kp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {commonMistakes.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <AlertCircle size={11} className="text-amber-500" /> Common Mistakes to Avoid
                </p>
                <div className="space-y-2">
                  {commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                      <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {followUps.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ChevronRight size={11} className="text-muted-foreground" /> Likely Follow-up Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUps.map((fq) => (
                    <span
                      key={fq}
                      className="text-[12px] font-medium px-3 py-1.5 bg-muted border border-border rounded-xl text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5 cursor-pointer transition-all"
                    >
                      {fq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isCreatedByCurrentUser && (
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(question);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl border border-primary/20 transition-all cursor-pointer"
                >
                  <Edit2 size={11} /> Edit Question
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(question);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl border border-destructive/20 transition-all cursor-pointer"
                >
                  <Trash2 size={11} /> Delete Question
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
