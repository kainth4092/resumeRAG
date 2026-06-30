import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchIcon, BrainCircuit, X, Plus, History, Sparkles } from "lucide-react";

import { useInterviewQuestions } from "../hooks/useInterviewQuestions";
import { useQuestionFilters } from "../hooks/useQuestionFilters";
import { QuestionGroup } from "../components/QuestionGroup";
import QuestionForm from "../components/QuestionForm";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

import AISidebar from "../components/AISidebar";
import HeroCard from "../components/HeroCard";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import HistoryDrawer from "../components/HistoryDrawer";
import { SearchBar } from "../components/SearchBar";

export default function InterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    questions,
    setQuestions,
    session,
    viewState,
    error,
    setError,
    success,
    setSuccess,
    setFetching,
    handleToggleBookmark,
    handleDeleteQuestion,
    handleSaveQuestion,
    mapExperienceToDifficulty,
    loadingQuestionId,
    handleQuestionExpand,
  } = useInterviewQuestions(location.state);

  const {
    search,
    setSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    setActiveFilter,
    filteredQuestions,
  } = useQuestionFilters({
    questions,
    setQuestions,
    viewState,
    setFetching,
    setError,
    locationState: location.state,
    mapExperienceToDifficulty,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    skill: "",
    category: "Technical",
    experience_level: "Fresher",
    tags: "",
  });
  const [formError, setFormError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const getQuestionTabCategory = useCallback((q) => {
    let cat = q.skill || q.category || "General";
    const lower = cat.toLowerCase();

    if (lower === "hr") {
      cat = "Behavioral";
    } else if (lower === "react") {
      cat = "React";
    } else if (lower === "python") {
      cat = "Python";
    } else if (lower === "fastapi") {
      cat = "FastAPI";
    } else if (lower === "postgresql") {
      cat = "PostgreSQL";
    } else if (lower === "javascript") {
      cat = "JavaScript";
    } else if (lower === "project" || lower === "projects") {
      cat = "Project";
    } else if (lower === "behavioral") {
      cat = "Behavioral";
    } else if (lower === "technical") {
      cat = "Technical";
    } else if (lower === "coding") {
      cat = "Coding";
    } else {
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
    return cat;
  }, []);

  const finalFilteredQuestions = filteredQuestions;

  const groupedQuestions = useMemo(() => {
    const groups = {};
    finalFilteredQuestions.forEach((q) => {
      const cat = getQuestionTabCategory(q);
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(q);
    });
    return groups;
  }, [finalFilteredQuestions, getQuestionTabCategory]);

  const sortedGroupedCategories = useMemo(() => {
    return Object.entries(groupedQuestions).sort(([a], [b]) => a.localeCompare(b));
  }, [groupedQuestions]);

  const handleEditClick = useCallback((q) => {
    setEditingQuestion(q);
    setFormData({
      question: q.question,
      answer: q.sampleAnswer || q.answer || "",
      skill: q.skill || "",
      category: q.category || "Technical",
      experience_level: q.experience_level || "Fresher",
      tags: Array.isArray(q.tags) ? q.tags.join(", ") : typeof q.tags === "string" ? q.tags : "",
    });
    setFormError("");
    setShowModal(true);
  }, []);

  const handleDeleteClick = useCallback((q) => {
    setQuestionToDelete(q);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!questionToDelete) return;
    setDeleting(true);
    const ok = await handleDeleteQuestion(questionToDelete.id);
    setDeleting(false);
    if (ok) {
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    }
  }, [questionToDelete, handleDeleteQuestion]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        question: formData.question,
        answer: formData.answer,
        skill: formData.skill,
        category: formData.category,
        experience_level: formData.experience_level,
        tags: tagsArray,
      };

      const ok = await handleSaveQuestion(payload, editingQuestion?.id);
      if (ok) {
        setShowModal(false);
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || "Failed to save question.");
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingQuestion, handleSaveQuestion]);

  const handleShareClick = useCallback(() => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      answer: "",
      skill: "",
      category: "Technical",
      experience_level: "Fresher",
      tags: "",
    });
    setFormError("");
    setShowModal(true);
  }, []);

  const jumpToNext = useCallback(() => {
    const next = finalFilteredQuestions[0];
    if (next) {
      setTimeout(
        () => document.getElementById(`q-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  }, [finalFilteredQuestions]);

  const jumpToRandom = useCallback(() => {
    if (!finalFilteredQuestions.length) return;
    const q = finalFilteredQuestions[Math.floor(Math.random() * finalFilteredQuestions.length)];
    setExpandedQuestionId(q.id);
    setTimeout(() => {
      document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, [finalFilteredQuestions]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <BrainCircuit className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Interview Prep</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Master role-specific questions and technical concepts.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            >
              <History size={13} /> History
            </button>
            <button
              onClick={() => navigate("/resumes?view=new")}
              className="flex items-center gap-1.5 h-9 px-3.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            >
              <Sparkles size={13} /> Regenerate
            </button>
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={13} /> Share Question
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {viewState === "loading" && <LoadingState />}

        {viewState === "empty" && <EmptyState onGoGenerate={() => navigate("/resumes?view=new")} />}

        {viewState === "active" && session && (
          <div className="space-y-5">
            <HeroCard
              session={session}
              setShowSidebar={setShowSidebar}
              questions={questions}
              jumpToNext={jumpToNext}
            />


            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0 space-y-4">
                <SearchBar
                  search={search}
                  setSearch={setSearch}
                  bookmarkOnly={bookmarkOnly}
                  setBookmarkOnly={setBookmarkOnly}
                  diffFilter={diffFilter}
                  setDiffFilter={setDiffFilter}
                  filteredCount={finalFilteredQuestions.length}
                />

                {finalFilteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center bg-card border border-border rounded-2xl">
                    <SearchIcon size={22} className="text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-semibold text-foreground mb-1">No questions match</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setDiffFilter("");
                        setBookmarkOnly(false);
                        setActiveFilter("All");
                      }}
                      className="text-xs text-primary hover:text-primary/80 font-semibold mt-2 cursor-pointer"
                    >
                      Clear filters →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in-50 duration-200">
                    {sortedGroupedCategories.map(([catName, catQuestions]) => (
                      <QuestionGroup
                        key={catName}
                        categoryName={catName}
                        questions={catQuestions}
                        onToggleBookmark={handleToggleBookmark}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        expandedQuestionId={expandedQuestionId}
                        onExpandQuestion={handleQuestionExpand}
                        loadingQuestionId={loadingQuestionId}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-6 h-fit">
                <AISidebar
                  questions={questions}
                  session={session}
                  onJumpRandom={jumpToRandom}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showSidebar && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border rounded-t-3xl shadow-(--shadow-lg) max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-border bg-card">
              <p className="font-semibold text-foreground">AI Assistant</p>
              <button onClick={() => setShowSidebar(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              {session && (
                <AISidebar
                  questions={questions}
                  session={session}
                  onJumpRandom={() => {
                    jumpToRandom();
                    setShowSidebar(false);
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      <QuestionForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        editingQuestion={editingQuestion}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        submitting={submitting}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectSession={(id) => {
          navigate(".", { state: { sessionId: id }, replace: true });
        }}
        activeSessionId={location.state?.sessionId}
      />
    </div>
  );
}
