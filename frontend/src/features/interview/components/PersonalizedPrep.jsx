import { useState, useEffect, useMemo, memo } from "react";
import { BrainCircuit, SearchIcon } from "lucide-react";
import HeroCard from "./HeroCard";
import { QuestionCard } from "./QuestionCard";
import InterviewFilterSidebar from "./InterviewFilterSidebar";

export const PersonalizedPrep = memo(function PersonalizedPrep({
  session,
  questions,
  viewState,
  search,
  setSearch,
  diffFilter,
  setDiffFilter,
  bookmarkOnly,
  setBookmarkOnly,
  importantOnly,
  setImportantOnly,
  activeFilter,
  setActiveFilter,
  finalFilteredQuestions,
  handleToggleBookmark,
  handleToggleImportant,
  handleEditClick,
  handleDeleteClick,
  expandedQuestionId,
  handleQuestionExpand,
  loadingQuestionId,
  jumpToNext,
  jumpToRandom,
  showPersonalizedEmpty,
}) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const skillsList = useMemo(() => {
    const counts = {};
    questions.forEach((q) => {
      let qSkill = q.skill || "General";
      if (q.category === "Behavioral") qSkill = "Behavioral";
      if (q.category === "Project") qSkill = "Projects";
      counts[qSkill] = (counts[qSkill] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [questions]);

  const getPageRange = (current, total) => {
    const range = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  useEffect(() => {
    setPage(1);
  }, [search, diffFilter, bookmarkOnly, importantOnly, activeFilter]);

  useEffect(() => {
    if (expandedQuestionId) {
      const idx = finalFilteredQuestions.findIndex(
        (q) => q.id === expandedQuestionId,
      );
      if (idx !== -1) {
        const pageNum = Math.ceil((idx + 1) / limit);
        setPage(pageNum);
      }
    }
  }, [expandedQuestionId, finalFilteredQuestions, limit]);

  if (viewState === "loading" || showPersonalizedEmpty || !session) {
    return null;
  }

  const isFiltered =
    search ||
    diffFilter ||
    bookmarkOnly ||
    importantOnly ||
    (activeFilter && activeFilter !== "All");
  const total = finalFilteredQuestions.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedQuestions = finalFilteredQuestions.slice(
    (page - 1) * limit,
    page * limit,
  );

  return (
    <div className="space-y-6">
      <HeroCard
        session={session}
        questions={questions}
        jumpToNext={jumpToNext}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
        {/* Sidebar Filters Panel */}
        <div className="lg:col-span-1">
          <InterviewFilterSidebar
            search={search}
            setSearch={setSearch}
            bookmarkOnly={bookmarkOnly}
            setBookmarkOnly={setBookmarkOnly}
            importantOnly={importantOnly}
            setImportantOnly={setImportantOnly}
            showImportant={true}
            skills={skillsList}
            activeSkill={activeFilter}
            setActiveSkill={setActiveFilter}
            difficulty={diffFilter}
            setDifficulty={setDiffFilter}
            onPracticeRandom={questions.length > 0 ? jumpToRandom : null}
            onReset={() => {
              setSearch("");
              setDiffFilter("");
              setBookmarkOnly(false);
              setImportantOnly(false);
              setActiveFilter("All");
            }}
          />
        </div>

        <div className="lg:col-span-3 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-semibold">
                Showing{" "}
                <strong className="text-foreground">
                  {total > 0 ? (page - 1) * limit + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground">
                  {Math.min(page * limit, total)}
                </strong>{" "}
                of <strong className="text-foreground">{total}</strong>{" "}
                Questions
              </span>
            </div>
            {isFiltered && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full select-none">
                Filtered Active
              </span>
            )}
          </div>

          <div className="space-y-4">
            {finalFilteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center bg-card border border-border rounded-2xl">
                <SearchIcon
                  size={22}
                  className="text-muted-foreground/30 mb-2"
                />
                <p className="text-sm font-semibold text-foreground mb-1">
                  No questions match
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setDiffFilter("");
                    setBookmarkOnly(false);
                    setImportantOnly(false);
                    setActiveFilter("All");
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-semibold mt-2 cursor-pointer"
                >
                  Clear filters →
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                {paginatedQuestions.map((q, idx) => {
                  const overallIndex = (page - 1) * limit + idx;
                  return (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={overallIndex}
                      onToggleBookmark={handleToggleBookmark}
                      onToggleImportant={handleToggleImportant}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      isInitiallyExpanded={q.id === expandedQuestionId}
                      onExpand={handleQuestionExpand}
                      isLoading={loadingQuestionId === q.id}
                    />
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border border-border bg-card px-4 py-3 rounded-2xl sm:px-6 mt-6 animate-in fade-in duration-200">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={page === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Showing{" "}
                          <span className="font-bold text-foreground">
                            {(page - 1) * limit + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-bold text-foreground">
                            {Math.min(page * limit, total)}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold text-foreground">
                            {total}
                          </span>{" "}
                          questions
                        </p>
                      </div>
                      <div>
                        <nav
                          className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/40 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <span className="sr-only">Previous</span>
                            &larr;
                          </button>
                          {getPageRange(page, totalPages).map((pageNum, i) => {
                            if (pageNum === "...") {
                              return (
                                <span
                                  key={`ellipsis-${i}`}
                                  className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground text-xs font-semibold select-none"
                                >
                                  ...
                                </span>
                              );
                            }
                            const isCurrent = pageNum === page;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-primary text-white border border-primary shadow-sm"
                                    : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() =>
                              setPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={page === totalPages}
                            className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/40 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <span className="sr-only">Next</span>
                            &rarr;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
