import { BrainCircuit, X, Plus } from "lucide-react";
import { useInterviewPrep } from "../hooks/useInterviewPrep";
import { PersonalizedPrep } from "../components/PersonalizedPrep";
import QuestionForm from "../components/QuestionForm";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ChallengeContainer from "../Challenge/ChallengeContainer";
import StudyLibrary from "../components/StudyLibrary";
import SessionHistory from "../components/SessionHistory";
import AIMockInterview from "../components/mock/AIMockInterview";

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
    activeFilter,
    setActiveFilter,
    finalFilteredQuestions,
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
    expandedQuestionId,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleFormSubmit,
    handleShareClick,
    jumpToNext,
    jumpToRandom,
    formErrors,
    generatingAI,
    isAISuggested,
    handleSuggestAnswer,
  } = useInterviewPrep();

  const showPersonalizedEmpty =
    viewState === "empty" || !session || session.resumeUsed === "None";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <BrainCircuit className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Interview Prep
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Master role-specific questions and technical concepts.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={13} /> Share Question
            </button>
          </div>
        </div>

        <div className="border-b border-border flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          {[
            { id: "personalized", label: "Personalized" },
            { id: "library", label: "Study Library" },
            { id: "challenge", label: "Interview Challenge" },
            { id: "mock", label: "AI Mock Interview" },
            { id: "history", label: "History" },
            { id: "community", label: "Community" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-all cursor-pointer font-medium ${
                activeTab === tab.id
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

        {activeTab === "personalized" && (
          <>
            {viewState === "loading" && <LoadingState />}

            {viewState !== "loading" && showPersonalizedEmpty && (
              <EmptyState onGoGenerate={() => navigate("/resumes?view=new")} />
            )}

            {viewState !== "loading" && !showPersonalizedEmpty && session && (
              <PersonalizedPrep
                session={session}
                questions={questions}
                viewState={viewState}
                search={search}
                setSearch={setSearch}
                diffFilter={diffFilter}
                setDiffFilter={setDiffFilter}
                bookmarkOnly={bookmarkOnly}
                setBookmarkOnly={setBookmarkOnly}
                importantOnly={importantOnly}
                setImportantOnly={setImportantOnly}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                finalFilteredQuestions={finalFilteredQuestions}
                handleToggleBookmark={handleToggleBookmark}
                handleToggleImportant={handleToggleImportant}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
                expandedQuestionId={expandedQuestionId}
                handleQuestionExpand={handleQuestionExpand}
                loadingQuestionId={loadingQuestionId}
                jumpToNext={jumpToNext}
                jumpToRandom={jumpToRandom}
                showPersonalizedEmpty={showPersonalizedEmpty}
              />
            )}
          </>
        )}

        {activeTab === "library" && (
          <div className="animate-in fade-in duration-200">
            <StudyLibrary
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        )}

        {activeTab === "challenge" && (
          <ChallengeContainer
            onBackToPrep={() => setActiveTab("personalized")}
          />
        )}

        {activeTab === "history" && (
          <div className="animate-in fade-in duration-200">
            <SessionHistory
              onSelectSession={(id) => {
                navigate(".", { state: { sessionId: id }, replace: true });
                setActiveTab("personalized");
              }}
              activeSessionId={
                location.state?.sessionId ||
                (session && session.resumeUsed !== "None"
                  ? location.state?.sessionId
                  : null)
              }
            />
          </div>
        )}

        {activeTab === "community" && (
          <div className="animate-in fade-in duration-200">
            <StudyLibrary
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              defaultSource="community"
            />
          </div>
        )}

        {activeTab === "mock" && (
          <div className="animate-in fade-in duration-200">
            <AIMockInterview />
          </div>
        )}
      </div>

      <QuestionForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        editingQuestion={editingQuestion}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        formErrors={formErrors}
        submitting={submitting}
        generatingAI={generatingAI}
        isAISuggested={isAISuggested}
        onSuggestAnswer={handleSuggestAnswer}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </div>
  );
}
