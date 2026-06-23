import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon, History, BrainCircuit, X,
} from "lucide-react";
import { CAT_CFG, DIFF_CFG } from "../../data/interviewConstants";
import { interviewService } from "../../services/interviewService";

import QuestionCard from "../../components/interview/QuestionCard";
import HistoryDrawer from "../../components/interview/HistoryDrawer";
import AISidebar from "../../components/interview/AISidebar";
import LoadingState from "../../components/interview/LoadingState";
import EmptyState from "../../components/interview/EmptyState";
import HeroCard from "../../components/interview/HeroCard";
import StatsRow from "../../components/interview/StatsRow";
import Toolbar from "../../components/interview/Toolbar";
import SectionCollapsible from "../../components/interview/SectionCollapsible";

import {
  asText,
  estimateMinutes,
  findTechnicalSkill,
  getProjectName,
  getCompanyName,
} from "../../utils/interviewUtils";

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState("");
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);

  const updateQuestion = useCallback((id, patch) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  }, []);

  const loadSession = useCallback(async (sessionId = null) => {
    try {
      setViewState("loading");
      let targetSessionId = sessionId;

      if (!targetSessionId) {
        const latestSessions = await interviewService.getHistory();
        if (latestSessions.length === 0) {
          setViewState("empty");
          setSession(null);
          setQuestions([]);
          return;
        }
        targetSessionId = latestSessions[0].id;
      }

      const fullSession = await interviewService.getSession(targetSessionId);

      setSession({
        ...fullSession,
        companyLogo: fullSession.company?.[0] || "I",
        logoColor: "#635BFF",
        resumeUsed: "Resume",
        atsScore: 91,
        generatedAt: new Date(fullSession.created_at).toLocaleDateString(),
        questionCount: fullSession.questions?.length || 0,
        difficulty: {
          easy: fullSession.questions?.filter((q) => q.difficulty === "Easy").length || 0,
          medium: fullSession.questions?.filter((q) => q.difficulty === "Medium").length || 0,
          hard: fullSession.questions?.filter((q) => q.difficulty === "Hard").length || 0,
        },
        status: "Ready",
      });

      const transformedQuestions = (fullSession.questions || []).map((q) => ({
        ...q,
        sampleAnswer: asText(q.answer),
        estimatedMins: q.estimated_duration || q.estimatedMins || estimateMinutes(q.answer),
      }));

      setQuestions(transformedQuestions);
      setViewState("active");
    } catch (err) {
      console.error("Failed to load session:", err);
      setViewState("empty");
      setSession(null);
      setQuestions([]);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleToggleBookmark = async (questionId) => {
    try {
      await interviewService.toggleBookmark(questionId);
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        const nextBookmarked = !question.bookmarked;
        updateQuestion(questionId, { bookmarked: nextBookmarked });
      }
    } catch (err) {
      console.error("Failed to bookmark question:", err);
    }
  };

  const handleQuestionExpand = async (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || question.details_generated) return;

    if (loadingQuestionId) {
      return;
    }

    setLoadingQuestionId(questionId);
    try {
      const details = await interviewService.getQuestionDetails(questionId);
      updateQuestion(questionId, {
        details_generated: true,
        sampleAnswer: asText(details.answer),
      });
    } catch (err) {
      console.error("Failed to load question details:", err);
    } finally {
      setLoadingQuestionId(null);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (bookmarkOnly && !q.bookmarked) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const jumpToNext = () => {
    const next = questions[0];
    if (next) {
      setTimeout(
        () => document.getElementById(`q-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  };

  const jumpToRandom = () => {
    if (!questions.length) return;
    const q = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Group the questions dynamically
  const groupedSections = [];

  // Group technical questions by skill
  const techQuestions = filteredQuestions.filter(q => q.category === "Technical");
  const skillGroups = {};
  techQuestions.forEach(q => {
    const skill = q.tech_skill || findTechnicalSkill(q.question);
    if (!skillGroups[skill]) {
      skillGroups[skill] = [];
    }
    skillGroups[skill].push(q);
  });

  // Add skill groups to sections
  Object.entries(skillGroups).forEach(([skillName, qs]) => {
    groupedSections.push({
      id: `skill-${skillName}`,
      title: skillName,
      count: qs.length,
      questions: qs,
      type: "skill"
    });
  });

  // Group project questions by project name
  const projQuestions = filteredQuestions.filter(q => q.category === "Project");
  if (projQuestions.length > 0) {
    const subGroups = {};
    let consensusProject = "ResumeRAG";
    for (const q of projQuestions) {
      const extracted = getProjectName(q.question);
      if (extracted && extracted !== "Project" && extracted !== "ResumeRAG") {
        consensusProject = extracted;
        break;
      }
    }
    projQuestions.forEach(q => {
      let projName = getProjectName(q.question);
      if (projName === "Project" || projName === "ResumeRAG") {
        projName = consensusProject;
      }
      if (!subGroups[projName]) {
        subGroups[projName] = [];
      }
      subGroups[projName].push(q);
    });
    groupedSections.push({
      id: "projects-section",
      title: "Projects",
      count: projQuestions.length,
      subGroups,
      type: "projects"
    });
  }

  // Group experience questions by company name
  const expQuestions = filteredQuestions.filter(q => q.category === "Experience");
  if (expQuestions.length > 0) {
    const subGroups = {};
    let consensusCompany = "Company Name";
    for (const q of expQuestions) {
      const extracted = getCompanyName(q.question);
      if (extracted && extracted !== "Company" && extracted !== "Company Name") {
        consensusCompany = extracted;
        break;
      }
    }
    expQuestions.forEach(q => {
      let compName = getCompanyName(q.question);
      if (compName === "Company" || compName === "Company Name") {
        compName = consensusCompany;
      }
      if (!subGroups[compName]) {
        subGroups[compName] = [];
      }
      subGroups[compName].push(q);
    });
    groupedSections.push({
      id: "experience-section",
      title: "Experience",
      count: expQuestions.length,
      subGroups,
      type: "experience"
    });
  }

  const skillOrder = ["React", "Python", "FastAPI", "PostgreSQL", "Docker"];
  
  groupedSections.sort((a, b) => {
    if (a.type === "experience") return 1;
    if (b.type === "experience") return -1;
    if (a.type === "projects") {
      if (b.type === "experience") return -1;
      return 1;
    }
    if (b.type === "projects") {
      if (a.type === "experience") return 1;
      return -1;
    }
    
    const idxA = skillOrder.indexOf(a.title);
    const idxB = skillOrder.indexOf(b.title);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  if (!session && viewState !== "empty" && viewState !== "loading") {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit size={48} className="text-muted-foreground mb-4 mx-auto" />
          <p className="text-muted-foreground">{error || "No session data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-5">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-foreground">Interview Prep</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Practice personalized interview questions generated from your resume and job description.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/30 transition-all"
            >
              <History size={14} className="text-muted-foreground" /> History
            </button>
          </div>
        </div>

        {viewState === "loading" && <LoadingState />}

        {viewState === "empty" && <EmptyState onGoGenerate={() => navigate("/generator")} />}

        {viewState === "active" && session && (
          <div className="space-y-5">

            <HeroCard session={session}
              setShowSidebar={setShowSidebar}
              questions={questions}
              jumpToNext={jumpToNext}
              DIFF_CFG={DIFF_CFG} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsRow
                session={session}
                questions={questions} />
            </div>

            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0 space-y-4">

                <Toolbar
                  search={search}
                  setSearch={setSearch}
                  setBookmarkOnly={setBookmarkOnly}
                  bookmarkOnly={bookmarkOnly}
                  diffFilter={diffFilter}
                  setDiffFilter={setDiffFilter}
                  filteredQuestions={filteredQuestions} />

                {groupedSections.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center bg-card border border-border rounded-2xl">
                    <SearchIcon size={22} className="text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-semibold text-foreground mb-1">No questions match</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setDiffFilter("");
                        setBookmarkOnly(false);
                      }}
                      className="text-xs text-primary hover:text-primary/80 font-semibold mt-2"
                    >
                      Clear filters →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedSections.map((section) => (
                      <SectionCollapsible
                        key={section.id}
                        title={section.title}
                        count={section.count}
                      >
                        {section.type === "skill" ? (
                          <div className="space-y-3">
                            {section.questions.map((q, i) => (
                              <QuestionCard
                                key={q.id}
                                question={q}
                                index={i}
                                onToggleBookmark={handleToggleBookmark}
                                loadingQuestionId={loadingQuestionId}
                                onExpand={() => handleQuestionExpand(q.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {Object.entries(section.subGroups).map(([subName, subQuestions]) => (
                              <div key={subName} className="space-y-2.5">
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                                  {subName}
                                </h4>
                                <div className="space-y-3">
                                  {subQuestions.map((q, i) => (
                                    <QuestionCard
                                      key={q.id}
                                      question={q}
                                      index={i}
                                      onToggleBookmark={handleToggleBookmark}
                                      loadingQuestionId={loadingQuestionId}
                                      onExpand={() => handleQuestionExpand(q.id)}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </SectionCollapsible>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-6 h-fit">
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
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border rounded-t-3xl shadow-[var(--shadow-lg)] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
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

      {showHistory && (
        <HistoryDrawer
          onClose={() => setShowHistory(false)}
          onOpenSession={(id) => loadSession(id)}
          onSessionDeleted={(deletedId) => {
            if (session?.id === deletedId) {
              loadSession();
            }
          }}
        />
      )}
    </div>
  );
}
