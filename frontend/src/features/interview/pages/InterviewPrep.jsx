import { SearchIcon, BrainCircuit, X, Plus, History, Sparkles } from "lucide-react";
import { useInterviewPrep } from "../hooks/useInterviewPrep";
import { QuestionGroup } from "../components/QuestionGroup";
import QuestionForm from "../components/QuestionForm";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import AISidebar from "../components/AISidebar";
import HeroCard from "../components/HeroCard";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import HistoryDrawer from "../components/HistoryDrawer";
import { SearchBar } from "../components/SearchBar";
import ChallengeContainer from "../Challenge/ChallengeContainer";

export default function InterviewPrep() {
  const {
    navigate,
    location,
    activeTab,
    setActiveTab,
    questions,
    session,
    viewState,
    error,
    setError,
    success,
    setSuccess,
    handleToggleBookmark,
    handleToggleImportant,
    loadingQuestionId,
    handleQuestionExpand,
    search,
    setSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    importantOnly,
    setImportantOnly,
    setActiveFilter,
    finalFilteredQuestions,
    sortedGroupedCategories,
    showModal,
    setShowModal,
    editingQuestion,
    submitting,
    formData,
    setFormData,
    formError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleting,
    showSidebar,
    setShowSidebar,
    historyOpen,
    setHistoryOpen,
    expandedQuestionId,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleFormSubmit,
    handleShareClick,
    jumpToNext,
    jumpToRandom,
  } = useInterviewPrep();

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

        <div className="border-b border-border flex gap-6 text-sm font-medium">
          {[
            { id: "questions", label: "Questions" },
            { id: "challenge", label: "Interview Challenge" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-all cursor-pointer font-semibold ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
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

        {activeTab === "questions" && (
          <>
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
                      importantOnly={importantOnly}
                      setImportantOnly={setImportantOnly}
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
                            setImportantOnly(false);
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
                            onToggleImportant={handleToggleImportant}
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
          </>
        )}

        {activeTab === "challenge" && (
          <ChallengeContainer onBackToPrep={() => setActiveTab("questions")} />
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
