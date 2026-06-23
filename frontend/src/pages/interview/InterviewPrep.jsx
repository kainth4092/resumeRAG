import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchIcon, BrainCircuit, X } from "lucide-react";
import { CAT_CFG, DIFF_CFG } from "../../data/interviewConstants";
import {
  retrieveInterviewQuestions,
  getAllInterviewQuestions,
} from "../../services/interviewBankService";

import QuestionCard from "../../components/interview/QuestionCard";
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
} from "../../utils/interviewUtils";

export default function InterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();

  const [viewState, setViewState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);
  const [error, setError] = useState("");
  const loadSession = useCallback(async () => {
    try {
      setError("");
      setViewState("loading");

      const resumeId = location.state?.resumeId || localStorage.getItem("last_resume_id");
      const jd = location.state?.jobDescription || localStorage.getItem("last_job_description");

      const savedBookmarks = JSON.parse(localStorage.getItem("bookmarked_questions") || "[]");

      if (!resumeId || !jd) {

        const res = await getAllInterviewQuestions();
        const data = res.data || [];

        const transformed = data.map((q) => ({
          ...q,
          bookmarked: savedBookmarks.includes(q.id),
          sampleAnswer: asText(q.answer),
          estimatedMins: q.estimated_duration || estimateMinutes(q.answer),
        }));

        setQuestions(transformed);

        if (transformed.length > 0) {
          setSession({
            company: "Interview Bank",
            role: "Software Engineer",
            companyLogo: "B",
            logoColor: "#7C3AED",
            resumeUsed: "None",
            generatedAt: new Date().toLocaleDateString(),
            questionCount: transformed.length,
            difficulty: {
              easy: transformed.filter((q) => q.difficulty === "Easy").length,
              medium: transformed.filter((q) => q.difficulty === "Medium").length,
              hard: transformed.filter((q) => q.difficulty === "Hard").length,
            },
            status: "Ready",
          });
          setViewState("active");
        } else {
          setViewState("empty");
        }
        return;
      }

      const res = await retrieveInterviewQuestions({
        resume_id: parseInt(resumeId, 10),
        job_description: jd,
      });

      const data = res.data || [];
      const transformed = data.map((q) => ({
        ...q,
        bookmarked: savedBookmarks.includes(q.id),
        sampleAnswer: asText(q.answer),
        estimatedMins: q.estimated_duration || estimateMinutes(q.answer),
      }));

      setQuestions(transformed);

      if (transformed.length > 0) {
        setSession({
          company: "Personalized Prep",
          role: "Interview Candidate",
          companyLogo: "P",
          logoColor: "#635BFF",
          resumeUsed: "Selected Resume",
          generatedAt: new Date().toLocaleDateString(),
          questionCount: transformed.length,
          difficulty: {
            easy: transformed.filter((q) => q.difficulty === "Easy").length,
            medium: transformed.filter((q) => q.difficulty === "Medium").length,
            hard: transformed.filter((q) => q.difficulty === "Hard").length,
          },
          status: "Ready",
        });
        setViewState("active");
      } else {

        const allRes = await getAllInterviewQuestions();
        const allData = allRes.data || [];
        const allTransformed = allData.map((q) => ({
          ...q,
          bookmarked: savedBookmarks.includes(q.id),
          sampleAnswer: asText(q.answer),
          estimatedMins: q.estimated_duration || estimateMinutes(q.answer),
        }));

        setQuestions(allTransformed);

        if (allTransformed.length > 0) {
          setSession({
            company: "Interview Bank",
            role: "Software Engineer",
            companyLogo: "B",
            logoColor: "#7C3AED",
            resumeUsed: "None",
            generatedAt: new Date().toLocaleDateString(),
            questionCount: allTransformed.length,
            difficulty: {
              easy: allTransformed.filter((q) => q.difficulty === "Easy").length,
              medium: allTransformed.filter((q) => q.difficulty === "Medium").length,
              hard: allTransformed.filter((q) => q.difficulty === "Hard").length,
            },
            status: "Ready",
          });
          setViewState("active");
        } else {
          setViewState("empty");
        }
      }
    } catch (err) {
      console.error("Failed to load session:", err);
      const detail = err.response?.data?.detail || err.message || "An unexpected error occurred.";
      setError(detail);
      setViewState("empty");
      setSession(null);
      setQuestions([]);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleToggleBookmark = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const nextBookmarked = !q.bookmarked;
          const saved = JSON.parse(localStorage.getItem("bookmarked_questions") || "[]");

          if (nextBookmarked) {
            if (!saved.includes(questionId)) {
              saved.push(questionId);
            }
          } else {
            const idx = saved.indexOf(questionId);
            if (idx > -1) {
              saved.splice(idx, 1);
            }
          }

          localStorage.setItem("bookmarked_questions", JSON.stringify(saved));
          return { ...q, bookmarked: nextBookmarked };
        }
        return q;
      })
    );
  };

  const handleQuestionExpand = (questionId) => {

    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, details_generated: true } : q))
    );
  };

  const filteredQuestions = questions.filter((q) => {
    if (bookmarkOnly && !q.bookmarked) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;

    if (activeFilter !== "All") {
      let qSkill = q.skill || "General";
      if (q.category === "Behavioral") qSkill = "Behavioral";
      if (q.category === "Project") qSkill = "Projects";

      if (qSkill.toLowerCase() !== activeFilter.toLowerCase()) {
        return false;
      }
    }
    if (search) {
      const query = search.toLowerCase();
      const matchQuestion = q.question?.toLowerCase().includes(query);
      const matchSkill = q.skill?.toLowerCase().includes(query);

      let matchTags = false;
      if (Array.isArray(q.tags)) {
        matchTags = q.tags.some((tag) => tag.toLowerCase().includes(query));
      } else if (typeof q.tags === "string") {
        matchTags = q.tags.toLowerCase().includes(query);
      }

      if (!matchQuestion && !matchSkill && !matchTags) {
        return false;
      }
    }

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

  const groupedSections = {};
  filteredQuestions.forEach((q) => {
    let skillGroup = q.skill || "General";

    if (skillGroup.toLowerCase() === "react") skillGroup = "React";
    else if (skillGroup.toLowerCase() === "python") skillGroup = "Python";
    else if (skillGroup.toLowerCase() === "fastapi") skillGroup = "FastAPI";
    else if (skillGroup.toLowerCase() === "postgresql") skillGroup = "PostgreSQL";
    else if (skillGroup.toLowerCase() === "javascript") skillGroup = "JavaScript";
    else if (skillGroup.toLowerCase() === "projects" || q.category === "Project") skillGroup = "Projects";
    else if (skillGroup.toLowerCase() === "behavioral" || q.category === "Behavioral") skillGroup = "Behavioral";

    if (!groupedSections[skillGroup]) {
      groupedSections[skillGroup] = [];
    }
    groupedSections[skillGroup].push(q);
  });
  const sortedSections = Object.entries(groupedSections).map(([title, qs]) => ({
    id: `skill-${title}`,
    title,
    count: qs.length,
    questions: qs,
  })).sort((a, b) => {
    if (a.title === "Projects") return 1;
    if (b.title === "Projects") return -1;
    if (a.title === "Behavioral") return 1;
    if (b.title === "Behavioral") return -1;
    return a.title.localeCompare(b.title);
  });

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
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

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

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 py-1">
                  {["All", "React", "Python", "FastAPI", "JavaScript", "PostgreSQL", "Projects", "Behavioral"].map((chip) => {
                    const active = activeFilter === chip;
                    return (
                      <button
                        key={chip}
                        onClick={() => setActiveFilter(chip)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${active
                          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                          : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20"
                          }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {sortedSections.length === 0 ? (
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
                      className="text-xs text-primary hover:text-primary/80 font-semibold mt-2"
                    >
                      Clear filters →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedSections.map((section) => (
                      <SectionCollapsible
                        key={section.id}
                        title={section.title}
                        count={section.count}
                      >
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
    </div>
  );
}
