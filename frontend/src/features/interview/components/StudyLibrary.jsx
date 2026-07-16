import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, BookOpen, X, RotateCcw } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import {
  getAllInterviewQuestions,
  getInterviewBankMeta,
  toggleBankBookmark,
} from "../services/interviewBankService";
import InterviewFilterSidebar from "./InterviewFilterSidebar";

const QuestionSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
      <div className="h-4 bg-muted rounded-md w-3/4" />
    </div>
    <div className="flex gap-2 pl-9">
      <div className="h-5 bg-muted rounded-full w-16" />
      <div className="h-5 bg-muted rounded-full w-20" />
      <div className="h-5 bg-muted rounded-full w-12" />
    </div>
  </div>
);

export default function StudyLibrary({
  onEdit,
  onDelete,
  defaultSource,
  refreshKey = 0,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [meta, setMeta] = useState({
    skills: [],
    categories: [],
    experience_levels: [],
    companies: [],
    difficulties: { Easy: 0, Medium: 0, Hard: 0 },
    bookmarks_count: 0,
  });

  const limit = 10;

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
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMeta = useCallback(async () => {
    try {
      const params = {
        search: debouncedSearch || undefined,
        skill: selectedSkill || undefined,
        difficulty: selectedDifficulty || undefined,
        category: selectedCategory || undefined,
        company: selectedCompany || undefined,
        bookmark_only: bookmarkOnly || undefined,
        source: defaultSource || undefined,
      };
      const res = await getInterviewBankMeta(params);
      if (res.data) {
        setMeta(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch library metadata:", err);
    }
  }, [
    debouncedSearch,
    selectedSkill,
    selectedDifficulty,
    selectedCategory,
    selectedCompany,
    bookmarkOnly,
    defaultSource,
  ]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const loadQuestions = useCallback(
    async (pageNum) => {
      setLoading(true);
      try {
        const params = {
          page: pageNum,
          limit,
          search: debouncedSearch || undefined,
          skill: selectedSkill || undefined,
          difficulty: selectedDifficulty || undefined,
          category: selectedCategory || undefined,
          company: selectedCompany || undefined,
          bookmark_only: bookmarkOnly || undefined,
          source: defaultSource || undefined,
        };

        const res = await getAllInterviewQuestions(params);

        if (res.data) {
          const { questions: fetchedQuestions = [], total: totalCount = 0 } =
            res.data;

          const normalizedQuestions = fetchedQuestions.map((q) => ({
            ...q,

            bookmarked: Boolean(
              q.bookmarked ?? q.is_bookmarked ?? (bookmarkOnly ? true : false),
            ),
          }));

          setQuestions(normalizedQuestions);
          setTotal(totalCount);
        }
      } catch (err) {
        console.error("Failed to load library questions:", err);
        setError("Failed to load interview questions.");
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      selectedSkill,
      selectedDifficulty,
      selectedCategory,
      selectedCompany,
      bookmarkOnly,
      defaultSource,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    selectedSkill,
    selectedDifficulty,
    selectedCategory,
    selectedCompany,
    bookmarkOnly,
  ]);

  useEffect(() => {
    loadQuestions(page);
  }, [page, loadQuestions, refreshKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [bookmarkLoadingId, setBookmarkLoadingId] = useState(null);

  const handleToggleBookmark = async (id) => {
    if (bookmarkLoadingId === id) return;

    const currentQuestion = questions.find((q) => q.id === id);
    if (!currentQuestion) return;

    const previousBookmarked = Boolean(
      currentQuestion.bookmarked ??
      currentQuestion.is_bookmarked ??
      (bookmarkOnly ? true : false),
    );

    const nextBookmarked = !previousBookmarked;

    setBookmarkLoadingId(id);
    setError("");
    setSuccess("");

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              bookmarked: nextBookmarked,
              is_bookmarked: nextBookmarked,
            }
          : q,
      ),
    );

    try {
      await toggleBankBookmark(id);
      if (bookmarkOnly && !nextBookmarked) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }

      await fetchMeta();

      setSuccess(
        nextBookmarked
          ? "Question bookmarked successfully."
          : "Bookmark removed successfully.",
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                bookmarked: previousBookmarked,
                is_bookmarked: previousBookmarked,
              }
            : q,
        ),
      );

      setError(err?.response?.data?.detail || "Failed to update bookmark.");
    } finally {
      setBookmarkLoadingId(null);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedSkill("");
    setSelectedDifficulty("");
    setSelectedCategory("");
    setSelectedCompany("");
    setBookmarkOnly(false);
  };

  const isFiltered =
    search ||
    selectedSkill ||
    selectedDifficulty ||
    selectedCategory ||
    selectedCompany ||
    bookmarkOnly;

  const [showSidebar, setShowSidebar] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
      <div
        className={`${showSidebar ? "lg:col-span-1" : "lg:col-span-0 hidden"}`}
      >
        <InterviewFilterSidebar
          key="library-filter"
          search={search}
          setSearch={setSearch}
          bookmarkOnly={bookmarkOnly}
          setBookmarkOnly={setBookmarkOnly}
          bookmarksCount={meta.bookmarks_count}
          skills={meta.skills}
          activeSkill={selectedSkill}
          setActiveSkill={setSelectedSkill}
          difficulty={selectedDifficulty}
          setDifficulty={setSelectedDifficulty}
          difficultyCounts={meta.difficulties}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={meta.categories}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          companies={meta.companies}
          onReset={clearAllFilters}
          isOpenMobile={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
          showDesktop={showSidebar}
        />
      </div>

      {/* Main Questions List Content Area */}
      <div
        className={`${showSidebar ? "lg:col-span-3" : "lg:col-span-4"} space-y-5 transition-all duration-300`}
      >
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground font-semibold">
              Showing{" "}
              <strong className="text-foreground">
                {total > 0 ? (page - 1) * limit + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {Math.min(page * limit, total)}
              </strong>{" "}
              of <strong className="text-foreground">{total}</strong> Questions
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isFiltered && (
              <span className="hidden sm:inline-block text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full select-none">
                Filtered Active
              </span>
            )}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileFiltersOpen(true);
                } else {
                  setShowSidebar(!showSidebar);
                }
              }}
              className="flex items-center gap-1.5 h-8 px-3 bg-muted hover:bg-muted/80 border border-border/40 text-foreground rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <SlidersHorizontal
                size={13}
                className={
                  showSidebar ? "text-primary" : "text-muted-foreground"
                }
              />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <QuestionSkeleton key={n} />
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {questions.map((q, index) => {
              const overallIndex = (page - 1) * limit + index;
              return (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={overallIndex}
                  onToggleBookmark={handleToggleBookmark}
                  // onToggleImportant={onToggleImportant}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isInitiallyExpanded={q.id === expandedQuestionId}
                  onExpand={setExpandedQuestionId}
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
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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
                      <span className="font-bold text-foreground">{total}</span>{" "}
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
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <SlidersHorizontal size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">
                No questions found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We couldn't find any questions matching your current filter
                selections. Try clearing your filters or altering your search
                text.
              </p>
            </div>
            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer"
              >
                <RotateCcw size={12} /> Clear Active Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
