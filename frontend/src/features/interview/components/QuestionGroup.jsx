import { useState, useEffect, memo } from "react";
import { ChevronDown, Sparkles, Atom, Terminal, Database, FileCode, Zap, Users, FolderOpen, Code2, BrainCircuit } from "lucide-react";
import { QuestionCard } from "./QuestionCard";

const CATEGORY_THEMES = {
  Technical: { icon: Code2, color: "#7C3AED", bg: "rgba(124, 58, 237, 0.08)", border: "rgba(124, 58, 237, 0.15)" },
  Behavioral: { icon: Users, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.15)" },
  Project: { icon: FolderOpen, color: "#ec4899", bg: "rgba(236, 72, 153, 0.08)", border: "rgba(236, 72, 153, 0.15)" },
  React: { icon: Atom, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.08)", border: "rgba(6, 182, 212, 0.15)" },
  Python: { icon: Terminal, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.15)" },
  FastAPI: { icon: Zap, color: "#009688", bg: "rgba(0, 150, 136, 0.08)", border: "rgba(0, 150, 136, 0.15)" },
  PostgreSQL: { icon: Database, color: "#6366f1", bg: "rgba(99, 102, 241, 0.08)", border: "rgba(99, 102, 241, 0.15)" },
  JavaScript: { icon: FileCode, color: "#eab308", bg: "rgba(234, 179, 8, 0.08)", border: "rgba(234, 179, 8, 0.15)" },
  Coding: { icon: Code2, color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.15)" },
  General: { icon: BrainCircuit, color: "#6b7280", bg: "rgba(107, 114, 128, 0.08)", border: "rgba(107, 114, 128, 0.15)" }
};

const getCategoryTheme = (catName) => {
  const normalized = Object.keys(CATEGORY_THEMES).find(
    (k) => k.toLowerCase() === catName.toLowerCase()
  );
  return CATEGORY_THEMES[normalized || "General"] || CATEGORY_THEMES.General;
};

export const QuestionGroup = memo(function QuestionGroup({
  categoryName,
  questions,
  onToggleBookmark,
  onEdit,
  onDelete,
  expandedQuestionId,
  onExpandQuestion,
  loadingQuestionId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getCategoryTheme(categoryName);
  const Icon = theme.icon || Sparkles;
  const bookmarkedCount = questions.filter((q) => q.bookmarked).length;

  const hasExpandedQuestion = questions.some((q) => q.id === expandedQuestionId);

  useEffect(() => {
    if (hasExpandedQuestion) {
      setIsOpen(true);
    }
  }, [hasExpandedQuestion]);

  return (
    <div
      className="bg-card border border-border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden relative"
      style={{
        borderLeft: `4px solid ${theme.color}`,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition-colors text-left focus:outline-none select-none cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.color,
            }}
          >
            <Icon size={18} className="transition-transform duration-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              {categoryName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>
              {bookmarkedCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                    ★ {bookmarkedCount} bookmarked
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-border bg-card/30">
          <div className="space-y-4 pt-5 animate-in fade-in duration-300">
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                onToggleBookmark={onToggleBookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                isInitiallyExpanded={q.id === expandedQuestionId}
                onExpand={onExpandQuestion}
                isLoading={loadingQuestionId === q.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
