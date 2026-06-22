import { useState, useEffect, useCallback } from "react";
import * as interviewService from "../services/interviewService";

export function useInterview() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [viewState, setViewState] = useState("loading");
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Technical");
    const [search, setSearch] = useState("");
    const [diffFilter, setDiffFilter] = useState("");
    const [bookmarkOnly, setBookmarkOnly] = useState(false);

    const [showTimer, setShowTimer] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const res = await interviewService.getInterviewHistory();
            setHistory(res.data || []);
            return res.data || [];
        } catch (err) {
            console.error("Failed to load interview history:", err);
            return [];
        }
    }, []);

    const loadSession = useCallback(async (sessionId) => {
        setLoading(true);
        try {
            const res = await interviewService.getInterviewSession(sessionId);
            const sess = res.data;
            setSession(sess);
            setQuestions(sess.questions || []);
            if (sess.questions?.length > 0) {

                setActiveCategory(sess.questions[0].category || "Technical");
            }
            setViewState("active");
        } catch (err) {
            console.error("Failed to load session:", err);
            setViewState("setup");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const hist = await loadHistory();
            if (hist && hist.length > 0) {
                await loadSession(hist[0].id);
            } else {
                setViewState("setup");
                setLoading(false);
            }
        };
        init();
    }, [loadHistory, loadSession]);

    const updateQuestionLocal = useCallback((questionId, patch) => {
        setQuestions(prev =>
            prev.map(q => (q.id === questionId ? { ...q, ...patch } : q))
        );
    }, []);

    // Toggle bookmark
    const handleToggleBookmark = useCallback(async (questionId) => {
        // Optimistic update
        setQuestions(prev =>
            prev.map(q => (q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q))
        );
        try {
            await interviewService.bookmarkQuestion(questionId);
        } catch (err) {
            console.error("Failed to toggle bookmark:", err);
            // Revert on error
            setQuestions(prev =>
                prev.map(q => (q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q))
            );
        }
    }, []);

    // Evaluate answer
    const handleEvaluateAnswer = useCallback(async (questionId, userAnswer) => {
        if (!userAnswer.trim()) return;

        updateQuestionLocal(questionId, { answered: true });

        try {
            const res = await interviewService.evaluateAnswer({
                question_id: questionId,
                user_answer: userAnswer,
            });

            const evalData = res.data;
            const formattedEvaluation = {
                overall: evalData.overall_score,
                technical: evalData.technical_score,
                communication: evalData.communication_score,
                confidence: evalData.confidence_score,
                strengths: evalData.strengths || [],
                weaknesses: evalData.weaknesses || [],
                missingPoints: evalData.missing_points || [],
                feedback: evalData.feedback || "",
                improvedAnswer: evalData.improved_answer || "",
                followUps: evalData.follow_ups || [],
            };

            updateQuestionLocal(questionId, {
                answered: true,
                user_answer: userAnswer,
                evaluation: formattedEvaluation,
            });
        } catch (err) {
            console.error("Failed to evaluate answer:", err);
            updateQuestionLocal(questionId, { answered: false });
            throw err;
        }
    }, [updateQuestionLocal]);

    // Generate new interview session
    const handleGenerateInterview = useCallback(async (data) => {
        setGenerating(true);
        setViewState("loading");
        try {
            const res = await interviewService.generateInterview(data);
            const sess = res.data.session;
            setSession(sess);
            setQuestions(sess.questions || []);
            if (sess.questions?.length > 0) {
                setActiveCategory(sess.questions[0].category || "Technical");
            }
            await loadHistory();
            setViewState("active");
        } catch (err) {
            console.error("Failed to generate interview:", err);
            setViewState("setup");
            throw err;
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    }, [loadHistory]);

    // Delete interview session
    const handleDeleteSession = useCallback(async (sessionId) => {
        try {
            await interviewService.deleteInterviewSession(sessionId);
            const hist = await loadHistory();

            // If we deleted the currently active session
            if (session?.id === sessionId) {
                if (hist && hist.length > 0) {
                    await loadSession(hist[0].id);
                } else {
                    setSession(null);
                    setQuestions([]);
                    setViewState("setup");
                }
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    }, [session, loadHistory, loadSession]);

    // Quick Actions
    const jumpToNext = useCallback(() => {
        const next = questions.find(q => !q.answered);
        if (next) {
            setActiveCategory(next.category);
            setTimeout(() => {
                document.getElementById(`q-${next.id}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 150);
        }
    }, [questions]);

    const jumpToRandom = useCallback(() => {
        const arr = questions.filter(q => q.category === activeCategory);
        if (!arr.length) return;
        const q = arr[Math.floor(Math.random() * arr.length)];
        document.getElementById(`q-${q.id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [questions, activeCategory]);

    const retryIncorrect = useCallback(() => {
        const low = questions.filter(q => q.evaluation && q.evaluation.overall < 70);
        if (low.length) {
            setActiveCategory(low[0].category);
            setTimeout(() => {
                document.getElementById(`q-${low[0].id}`)?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 150);
        }
    }, [questions]);

    return {
        loading,
        generating,
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
    };
}
