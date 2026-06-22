import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon, Timer, History, RefreshCw, BookmarkCheck, BrainCircuit,
  CheckCircle2, Trophy, Play, FileText, BarChart3, X,
} from "lucide-react";
import { CAT_CFG, DIFF_CFG } from "../../data/interviewConstants";
import { interviewService } from "../../services/interviewService";

import QuestionCard from "../../components/interview/QuestionCard";
import FloatingTimer from "../../components/interview/FloatingTimer";
import HistoryDrawer from "../../components/interview/HistoryDrawer";
import AISidebar from "../../components/interview/AISidebar";
import LoadingState from "../../components/interview/LoadingState";
import EmptyState from "../../components/interview/EmptyState";

const asText = (value) => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return asText(
      value.sample_answer ?? value.content ?? value.text ?? value.answer ?? value.value ?? ""
    );
  }
  return String(value);
};

const estimateMinutes = (value, fallback = 3) => {
  if (!value || typeof value !== "object") return fallback;
  const duration = value.duration;
  if (typeof duration === "number") return duration;
  if (typeof duration !== "string") return fallback;
  const numbers = duration.match(/\d+/g);
  if (!numbers || numbers.length === 0) return fallback;
  const parsed = Number(numbers[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Technical");
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        setViewState("loading");
        const latestSessions = await interviewService.getHistory();
        
        if (latestSessions.length === 0) {
          setViewState("empty");
          return;
        }

        const latestSession = latestSessions[0];
        const fullSession = await interviewService.getSession(latestSession.id);
        
        setSession({
          ...fullSession,
          companyLogo: fullSession.company?.[0] || "I",
          logoColor: "#635BFF",
          resumeUsed: "Resume",
          atsScore: 91,
          generatedAt: "Today at 2:14 PM",
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
          keyConcepts: q.key_points || q.keyConcepts || [],
          commonMistakes: q.common_mistakes || q.commonMistakes || [],
          sampleAnswer: asText(q.answer),
          estimatedMins: q.estimatedMins || estimateMinutes(q.answer),
          tip: asText(q.tip),
          answer: q.user_answer || "",
          answered: !!q.user_answer,
          evaluation: q.evaluation ? {
            overall: q.evaluation.overall_score || 0,
            technical: q.evaluation.technical_score || 0,
            communication: q.evaluation.communication_score || 0,
            confidence: q.evaluation.confidence_score || 0,
            strengths: q.evaluation.strengths || [],
            weaknesses: q.evaluation.weaknesses || [],
            missingPoints: q.evaluation.missing_points || [],
            improvedAnswer: q.evaluation.improved_answer || "",
            followUps: [],
          } : null,
        }));

        setQuestions(transformedQuestions);
        setViewState("active");
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load interview session");
        setViewState("empty");
      }
    };

    loadSession();
  }, []);

  const updateQuestion = useCallback((id, patch) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  }, []);

  const handleToggleBookmark = async (questionId) => {
    try {
      await interviewService.toggleBookmark(questionId);
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        updateQuestion(questionId, { bookmarked: !question.bookmarked });
      }
    } catch (err) {
      console.error("Failed to bookmark question:", err);
    }
  };

  const handleEvaluateAnswer = async (questionId, answer) => {
    try {
      const result = await interviewService.evaluateAnswer({
        question_id: questionId,
        user_answer: answer,
      });

      updateQuestion(questionId, {
        answered: true,
        evaluation: {
          overall: result.overall_score,
          technical: result.technical_score,
          communication: result.communication_score,
          confidence: result.confidence_score,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          missingPoints: result.missing_points,
          improvedAnswer: result.improved_answer,
          followUps: result.followUps || [],
        },
      });
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
      throw err;
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (q.category !== activeCategory) return false;
    if (bookmarkOnly && !q.bookmarked) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryQuestions = (cat) => questions.filter((q) => q.category === cat);
  const answered = questions.filter((q) => q.answered).length;

  const jumpToNext = () => {
    const next = questions.find((q) => !q.answered);
    if (next) {
      setActiveCategory(next.category);
      setTimeout(
        () => document.getElementById(`q-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  };

  const jumpToRandom = () => {
    const arr = categoryQuestions(activeCategory);
    if (!arr.length) return;
    const q = arr[Math.floor(Math.random() * arr.length)];
    document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const retryIncorrect = () => {
    const low = questions.filter((q) => q.evaluation && q.evaluation.overall < 70);
    if (low.length) {
      setActiveCategory(low[0].category);
      setTimeout(
        () => document.getElementById(`q-${low[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  };

  const regenerate = async () => {
    try {
      setViewState("loading");
      setQuestions([]);
      await new Promise((r) => setTimeout(r, 1000));
      setQuestions((prev) =>
        prev.map((q) => ({
          ...q,
          answered: false,
          answer: "",
          evaluation: null,
          bookmarked: false,
        }))
      );
      setViewState("active");
    } catch (err) {
      console.error("Failed to regenerate:", err);
      setViewState("active");
    }
  };

  const categories = Object.keys(CAT_CFG);

  if (!session && viewState !== "empty" && viewState !== "loading") {
    return (
      <div className="h-full overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit size={48} className="text-muted-foreground mb-4 mx-auto" />
          <p className="text-muted-foreground">{error || "No session data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
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
              onClick={() => setShowTimer((t) => !t)}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-xl border text-sm font-semibold transition-all ${
                showTimer ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Timer size={14} /> Timer
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted hover:border-primary/30 transition-all"
            >
              <History size={14} className="text-muted-foreground" /> History
            </button>
            {viewState === "active" && (
              <button
                onClick={regenerate}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm shadow-primary/20"
              >
                <RefreshCw size={14} /> Regenerate
              </button>
            )}
          </div>
        </div>

        {viewState === "loading" && <LoadingState />}

        {viewState === "empty" && <EmptyState onGoGenerate={() => navigate("/generator")} />}

        {viewState === "active" && session && (
          <div className="space-y-5">
            {/* Hero card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-sm)] relative">
              <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <div className="p-5 md:p-6">
                <div className="flex items-start gap-5 flex-wrap">
                  {/* Logo */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: session.logoColor }}
                  >
                    {session.companyLogo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h2 className="text-foreground text-lg">{session.company || "Company"}</h2>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to Practice
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{session.role || "Role"}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileText size={11} />
                        {session.resumeUsed || "Resume"}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} />
                        ATS {session.atsScore || 0}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { label: "Questions", value: session.questionCount || 0, color: "text-primary" },
                      { label: "Answered", value: answered, color: "text-emerald-600 dark:text-emerald-400" },
                    ].map((s) => (
                      <div key={s.label} className="text-center px-4 py-2.5 bg-muted/40 rounded-xl border border-border">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={jumpToNext}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
                    >
                      <Play size={14} /> Start Practice
                    </button>
                    <button
                      onClick={() => setShowSidebar(true)}
                      className="lg:hidden flex items-center justify-center w-9 h-9 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all"
                    >
                      <BarChart3 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-medium">Difficulty mix:</span>
                  {[
                    { label: "Easy", count: session.difficulty?.easy || 0, ...DIFF_CFG["Easy"] },
                    { label: "Medium", count: session.difficulty?.medium || 0, ...DIFF_CFG["Medium"] },
                    { label: "Hard", count: session.difficulty?.hard || 0, ...DIFF_CFG["Hard"] },
                  ].map((d) => (
                    <span
                      key={d.label}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: d.color, backgroundColor: d.bg, border: `1px solid ${d.border}` }}
                    >
                      {d.count} {d.label}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${((answered / (session.questionCount || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {Math.round(((answered / (session.questionCount || 1)) * 100))}% complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Questions",
                  value: session.questionCount || 0,
                  icon: BrainCircuit,
                  color: "#7C3AED",
                  bg: "#f5f3ff",
                },
                {
                  label: "Answered",
                  value: answered,
                  icon: CheckCircle2,
                  color: "#10b981",
                  bg: "#ecfdf5",
                },
                {
                  label: "Bookmarked",
                  value: questions.filter((q) => q.bookmarked).length,
                  icon: BookmarkCheck,
                  color: "#f59e0b",
                  bg: "#fffbeb",
                },
                {
                  label: "Avg Score",
                  value: questions.filter((q) => q.evaluation).length > 0
                    ? `${Math.round(
                        questions.filter((q) => q.evaluation).reduce((s, q) => s + (q.evaluation?.overall ?? 0), 0) /
                          questions.filter((q) => q.evaluation).length
                      )}%`
                    : "—",
                  icon: Trophy,
                  color: "#3b82f6",
                  bg: "#eff6ff",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card border border-border rounded-2xl p-4 hover:shadow-[var(--shadow-sm)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
                    <s.icon size={17} style={{ color: s.color }} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-5 items-start">           
              <div className="flex-1 min-w-0 space-y-4">
                <div className="bg-card border border-border rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
                  {categories.map((cat) => {
                    const cfg = CAT_CFG[cat];
                    const Icon = cfg.icon;
                    const total = categoryQuestions(cat).length;
                    const done = categoryQuestions(cat).filter((q) => q.answered).length;
                    const active = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                          active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{cat}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {done}/{total}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  <div className="relative flex-shrink-0 w-48">
                    <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search…"
                      className="w-full h-9 pl-9 pr-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>
                  <div className="w-44 flex-shrink-0">
                    
                  </div>
                  <button
                    onClick={() => setBookmarkOnly((b) => !b)}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
                      bookmarkOnly ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <BookmarkCheck size={13} className={bookmarkOnly ? "fill-amber-500" : ""} />
                    <span className="hidden sm:inline">Saved</span>
                  </button>
                  <button
                    onClick={() => setShowTimer((t) => !t)}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
                      showTimer ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Timer size={13} /> <span className="hidden sm:inline">Timer</span>
                  </button>
                  <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{filteredQuestions.length} questions</span>
                </div>

                {filteredQuestions.length === 0 ? (
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
                  <div className="space-y-3">
                    {filteredQuestions.map((q, i) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={i}
                        onUpdate={(patch) => updateQuestion(q.id, patch)}
                        onToggleBookmark={handleToggleBookmark}
                        onEvaluate={handleEvaluateAnswer}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-4">
                <AISidebar
                  questions={questions}
                  session={session}
                  activeCategory={activeCategory}
                  onJumpNext={jumpToNext}
                  onJumpRandom={jumpToRandom}
                  onRetryIncorrect={retryIncorrect}
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
                  activeCategory={activeCategory}
                  onJumpNext={() => {
                    jumpToNext();
                    setShowSidebar(false);
                  }}
                  onJumpRandom={() => {
                    jumpToRandom();
                    setShowSidebar(false);
                  }}
                  onRetryIncorrect={() => {
                    retryIncorrect();
                    setShowSidebar(false);
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {showTimer && <FloatingTimer onClose={() => setShowTimer(false)} />}
      {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
    </div>
  );
}
