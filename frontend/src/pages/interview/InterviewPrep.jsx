import { useNavigate } from "react-router-dom";
import { useInterview } from "../../hooks/useInterview";

// Components
import Header from "../../components/interview/Header";
import HeroCard from "../../components/interview/HeroCard";
import StatsCards from "../../components/interview/StatsCards";
import CategoryTabs from "../../components/interview/CategoryTabs";
import Toolbar from "../../components/interview/Toolbar";
import QuestionCard from "../../components/interview/QuestionCard";
import FloatingTimer from "../../components/interview/FloatingTimer";
import HistoryDrawer from "../../components/interview/HistoryDrawer";
import AISidebar from "../../components/interview/AISidebar";
import LoadingState from "../../components/interview/LoadingState";
import EmptyState from "../../components/interview/EmptyState";
import InterviewSetup from "../../components/interview/InterviewSetup";

export default function InterviewPrep() {
    const navigate = useNavigate();
    const {
        loading,
        viewState,
        session,
        questions,
        history,
        activeCategory,
        setActiveCategory,
        search,
        setSearch,
        diffFilter,
        setDiffFilter,
        bookmarkOnly,
        setBookmarkOnly,
        showTimer,
        setShowTimer,
        showHistory,
        setShowHistory,
        showSidebar,
        setShowSidebar,
        loadSession,
        handleToggleBookmark,
        handleEvaluateAnswer,
        handleGenerateInterview,
        handleDeleteSession,
        updateQuestionLocal,
        jumpToNext,
        jumpToRandom,
        retryIncorrect,
        setViewState,
    } = useInterview();

    // Categories available in current questions
    const categories = Array.from(new Set(questions.map(q => q.category)));

    // Filter questions locally
    const filteredQuestions = questions.filter(q => {
        if (q.category !== activeCategory) return false;
        if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
        if (diffFilter && q.difficulty !== diffFilter) return false;
        if (bookmarkOnly && !q.bookmarked) return false;
        return true;
    });

    if (viewState === "loading" || (loading && viewState === "active")) {
        return (
            <div className="h-full overflow-y-auto bg-background">
                <div className="max-w-7xl mx-auto p-6">
                    <LoadingState />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto font-sans bg-background">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <Header
                    showTimer={showTimer}
                    setShowTimer={setShowTimer}
                    showHistory={showHistory}
                    setShowHistory={setShowHistory}
                    onRegenerate={() => setViewState("setup")}
                    viewState={viewState}
                />

                {viewState === "setup" ? (
                    <InterviewSetup
                        onGenerate={handleGenerateInterview}
                        onCancel={() => setViewState("active")}
                        hasSessions={history.length > 0}
                    />
                ) : viewState === "empty" ? (
                    <EmptyState onCreateSession={() => setViewState("setup")} />
                ) : (
                    <>
                        {/* Main Session View */}
                        <HeroCard
                            session={session}
                            questions={questions}
                            jumpToNext={jumpToNext}
                            setShowSidebar={setShowSidebar}
                            navigate={navigate}
                        />

                        <StatsCards questions={questions} />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                            {/* Questions list area */}
                            <div className="lg:col-span-3 space-y-4">
                                <CategoryTabs
                                    categories={categories.length > 0 ? categories : ["Technical", "Behavioral", "HR", "Coding", "Project"]}
                                    activeCategory={activeCategory}
                                    setActiveCategory={setActiveCategory}
                                    questions={questions}
                                />

                                <Toolbar
                                    search={search}
                                    setSearch={setSearch}
                                    diffFilter={diffFilter}
                                    setDiffFilter={setDiffFilter}
                                    bookmarkOnly={bookmarkOnly}
                                    setBookmarkOnly={setBookmarkOnly}
                                    showTimer={showTimer}
                                    setShowTimer={setShowTimer}
                                    filteredCount={filteredQuestions.length}
                                />

                                <div className="space-y-3">
                                    {filteredQuestions.length === 0 ? (
                                        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground text-xs font-semibold">
                                            No questions match the current filters.
                                        </div>
                                    ) : (
                                        filteredQuestions.map((q, idx) => (
                                            <QuestionCard
                                                key={q.id}
                                                q={q}
                                                idx={questions.indexOf(q)}
                                                onUpdateQuestionLocal={updateQuestionLocal}
                                                handleToggleBookmark={handleToggleBookmark}
                                                handleEvaluateAnswer={handleEvaluateAnswer}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sidebar area (Desktop only) */}
                            <div className="hidden lg:block lg:col-span-1">
                                <AISidebar
                                    questions={questions}
                                    activeCategory={activeCategory}
                                    setActiveCategory={setActiveCategory}
                                    jumpToNext={jumpToNext}
                                    jumpToRandom={jumpToRandom}
                                    retryIncorrect={retryIncorrect}
                                    session={session}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Floating Timer */}
            <FloatingTimer showTimer={showTimer} setShowTimer={setShowTimer} />

            {/* History Drawer */}
            <HistoryDrawer
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                history={history}
                activeSessionId={session?.id}
                onSelectSession={loadSession}
                onDeleteSession={handleDeleteSession}
            />

            {/* Mobile Sidebar Modal */}
            {showSidebar && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border p-6 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-foreground">Session Analytics</h3>
                            <button
                                onClick={() => setShowSidebar(false)}
                                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                                Close
                            </button>
                        </div>
                        <AISidebar
                            questions={questions}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            jumpToNext={jumpToNext}
                            jumpToRandom={jumpToRandom}
                            retryIncorrect={retryIncorrect}
                            session={session}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
