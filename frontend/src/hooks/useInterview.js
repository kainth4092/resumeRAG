import { useCallback, useEffect, useMemo, useState } from "react";
import * as interviewService from "../services/interviewService";
import { normalizeHistory, normalizeSession } from "../utils/interviewHelpers";

export function useInterview() {
  const [viewState, setViewState] = useState("loading");
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Technical");
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);

  const updateQuestionLocal = useCallback((id, patch) => {
    setQuestions((current) => current.map((question) => (
      question.id === id ? { ...question, ...patch } : question
    )));
  }, []);

  const loadSession = useCallback(async (id) => {
    setViewState("loading");
    setError("");
    try {
      const response = await interviewService.getInterviewSession(id);
      const nextSession = normalizeSession(response.data);
      setSession(nextSession);
      setQuestions(nextSession.questions);
      setActiveCategory(nextSession.questions[0]?.category || "Technical");
      setViewState(nextSession.questions.length ? "active" : "empty");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load the interview session.");
      setViewState("empty");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    const response = await interviewService.getInterviewHistory();
    const items = (response.data || []).map(normalizeHistory);
    setHistory(items);
    return items;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const items = await loadHistory();
        if (items.length) await loadSession(items[0].id);
        else setViewState("empty");
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load interview history.");
        setViewState("empty");
      }
    };
    initialize();
  }, [loadHistory, loadSession]);

  const toggleBookmark = useCallback(async (id) => {
    const original = questions.find((question) => question.id === id)?.bookmarked;
    updateQuestionLocal(id, { bookmarked: !original });
    try {
      const response = await interviewService.bookmarkQuestion(id);
      updateQuestionLocal(id, { bookmarked: response.data.bookmarked });
    } catch (requestError) {
      updateQuestionLocal(id, { bookmarked: original });
      throw requestError;
    }
  }, [questions, updateQuestionLocal]);

  const evaluateAnswer = useCallback(async (id, answer) => {
    const response = await interviewService.evaluateAnswer({
      question_id: id,
      user_answer: answer,
    });
    const data = response.data;
    const question = questions.find((item) => item.id === id);
    updateQuestionLocal(id, {
      answered: true,
      answer,
      evaluation: {
        overall: Math.round(data.overall_score),
        technical: Math.round(data.technical_score),
        communication: Math.round(data.communication_score),
        confidence: Math.round(data.confidence_score),
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        missingPoints: data.missing_points || [],
        improvedAnswer: data.improved_answer || "",
        followUps: data.follow_ups || question?.followUps || [],
      },
    });
  }, [questions, updateQuestionLocal]);

  const regenerate = useCallback(async () => {
    if (!session) return;
    setViewState("loading");
    setError("");
    try {
      const response = await interviewService.generateInterview({
        resume_id: session.resume_id,
        job_description: session.job_description,
        company: session.company,
        role: session.role,
      });
      const nextSession = normalizeSession(response.data.session);
      setSession(nextSession);
      setQuestions(nextSession.questions);
      setActiveCategory(nextSession.questions[0]?.category || "Technical");
      await loadHistory();
      setViewState("active");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to regenerate questions.");
      setViewState("active");
    }
  }, [loadHistory, session]);

  const deleteSession = useCallback(async (id) => {
    await interviewService.deleteInterviewSession(id);
    const items = await loadHistory();
    if (session?.id === id) {
      if (items.length) await loadSession(items[0].id);
      else {
        setSession(null);
        setQuestions([]);
        setViewState("empty");
      }
    }
  }, [loadHistory, loadSession, session]);

  const filteredQuestions = useMemo(() => questions.filter((question) => {
    if (question.category !== activeCategory) return false;
    if (bookmarkOnly && !question.bookmarked) return false;
    if (diffFilter && question.difficulty !== diffFilter) return false;
    return !search || question.question.toLowerCase().includes(search.toLowerCase());
  }), [activeCategory, bookmarkOnly, diffFilter, questions, search]);

  return {
    viewState, session, questions, history, error, setError,
    activeCategory, setActiveCategory, search, setSearch,
    diffFilter, setDiffFilter, bookmarkOnly, setBookmarkOnly,
    filteredQuestions, updateQuestionLocal, toggleBookmark,
    evaluateAnswer, regenerate, deleteSession, loadSession,
  };
}
