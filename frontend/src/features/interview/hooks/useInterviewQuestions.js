import { useState, useEffect, useCallback } from "react";
import {
  createInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
} from "../services/interviewBankService";
import {
  getInterviewSession,
  getInterviewHistory,
  getQuestionDetails,
  bookmarkQuestion,
} from "../services/interviewService";
import { asText, estimateMinutes } from "../../../utils/interviewUtils";
import { useAuth } from "../../auth/context/AuthContext";

const mapExperienceToDifficulty = (exp) => {
  if (!exp) return "Medium";
  const str = String(exp).toLowerCase();
  if (
    str.includes("fresher") ||
    str.includes("junior") ||
    str.includes("easy") ||
    str.includes("0-")
  ) {
    return "Easy";
  }
  if (
    str.includes("3-5") ||
    str.includes("senior") ||
    str.includes("hard") ||
    str.includes("5+")
  ) {
    return "Hard";
  }
  return "Medium";
};

export function useInterviewQuestions(locationState) {
  const { user } = useAuth();
  const bookmarkedQuestionsKey = user?.email
    ? `bookmarked_questions_${user.email}`
    : "bookmarked_questions";

  const [viewState, setViewState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [loadingQuestionId, setLoadingQuestionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fetching, setFetching] = useState(false);

  const loadSession = useCallback(async () => {
    if (!user) return;
    try {
      setError("");
      setViewState("loading");

      let sessionId = locationState?.sessionId;
      if (!sessionId) {
        try {
          const history = await getInterviewHistory();
          if (history && history.length > 0) {
            sessionId = history[0].id;
          }
        } catch (historyErr) {
          console.error(
            "Failed to load interview history for auto-load:",
            historyErr,
          );
        }
      }

      if (sessionId) {
        const res = await getInterviewSession(sessionId);
        const transformed = (res.questions || []).map((q) => ({
          ...q,
          skill: q.tech_skill || q.skill,
          difficulty:
            q.difficulty || mapExperienceToDifficulty(q.experience_level),
          bookmarked: q.bookmarked,
          is_personalized:
            q.is_personalized !== undefined ? q.is_personalized : true,
          source: q.source || "resume_generated",
          sampleAnswer: asText(q.answer),
          estimatedMins: q.estimated_duration || estimateMinutes(q.answer),
        }));

        setQuestions(transformed);

        setSession({
          company: res.company || "Interview Prep",
          role: res.role || "Software Engineer",
          companyLogo: res.company ? res.company[0].toUpperCase() : "P",
          logoColor: "#635BFF",
          resumeUsed: res.resume_title || "Selected Resume",
          generatedAt: new Date(res.created_at).toLocaleDateString(),
          questionCount: transformed.length,
          difficulty: {
            easy: transformed.filter((q) => q.difficulty === "Easy").length,
            medium: transformed.filter((q) => q.difficulty === "Medium").length,
            hard: transformed.filter((q) => q.difficulty === "Hard").length,
          },
          status: "Ready",
        });
        setViewState("active");
        return;
      }
    } catch (err) {
      console.error("Failed to load session:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "An unexpected error occurred.";
      setError(detail);
      setQuestions([]);
      setSession(null);
      setViewState("empty");
      return;
    }
  }, [locationState, user, bookmarkedQuestionsKey]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadSession();
  }, [loadSession]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleToggleBookmark = useCallback(
    async (questionId) => {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            const nextBookmarked = !q.bookmarked;
            const saved = JSON.parse(
              localStorage.getItem(bookmarkedQuestionsKey) || "[]",
            );

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

            localStorage.setItem(bookmarkedQuestionsKey, JSON.stringify(saved));
            return { ...q, bookmarked: nextBookmarked };
          }
          return q;
        }),
      );

      try {
        await bookmarkQuestion(questionId);
      } catch (err) {
        console.error("Failed to persist bookmark to backend:", err);
      }
    },
    [bookmarkedQuestionsKey],
  );

  const handleQuestionExpand = useCallback(
    async (questionId) => {
      const q = questions.find((item) => item.id === questionId);
      if (!q) return;

      setQuestions((prev) =>
        prev.map((item) =>
          item.id === questionId ? { ...item, details_generated: true } : item,
        ),
      );

      if (q.sampleAnswer || q.answer) {
        return;
      }

      setLoadingQuestionId(questionId);
      try {
        const res = await getQuestionDetails(questionId);
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === questionId
              ? {
                  ...item,
                  answer: res.answer,
                  sampleAnswer: asText(res.answer),
                }
              : item,
          ),
        );
      } catch (err) {
        console.error("Failed to generate/retrieve sample answer:", err);
      } finally {
        setLoadingQuestionId(null);
      }
    },
    [questions],
  );

  const handleDeleteQuestion = useCallback(async (questionId) => {
    setError("");
    setSuccess("");
    try {
      await deleteInterviewQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setSuccess("Question deleted successfully.");
      return true;
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to delete question.",
      );
      return false;
    }
  }, []);

  const handleSaveQuestion = useCallback(
    async (payload, editingQuestionId = null) => {
      setError("");
      setSuccess("");
      try {
        if (editingQuestionId) {
          setLoadingQuestionId(editingQuestionId);
          const res = await updateInterviewQuestion(editingQuestionId, payload);
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === editingQuestionId
                ? {
                    ...q,
                    ...res.data,
                    skill: res.data.tech_skill || res.data.skill || q.skill,
                    difficulty: mapExperienceToDifficulty(
                      res.data.experience_level,
                    ),
                    sampleAnswer: asText(res.data.answer),
                    estimatedMins:
                      res.data.estimated_duration ||
                      estimateMinutes(res.data.answer),
                  }
                : q,
            ),
          );
          setSuccess("Question updated successfully.");
        } else {
          const res = await createInterviewQuestion(payload);
          const savedBookmarks = JSON.parse(
            localStorage.getItem(bookmarkedQuestionsKey) || "[]",
          );
          const newQ = {
            ...res.data,
            skill: res.data.tech_skill || res.data.skill,
            difficulty: mapExperienceToDifficulty(res.data.experience_level),
            bookmarked: savedBookmarks.includes(res.data.id),
            is_personalized:
              res.data.is_personalized !== undefined
                ? res.data.is_personalized
                : false,
            source: res.data.source || "question_bank",
            sampleAnswer: asText(res.data.answer),
            estimatedMins:
              res.data.estimated_duration || estimateMinutes(res.data.answer),
          };
          setQuestions((prev) => [newQ, ...prev]);
          setSuccess("Question shared successfully.");
        }
        return true;
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to save question.",
        );
        throw err;
      } finally {
        setLoadingQuestionId(null);
      }
    },
    [bookmarkedQuestionsKey],
  );

  return {
    questions,
    setQuestions,
    session,
    viewState,
    error,
    setError,
    success,
    setSuccess,
    fetching,
    setFetching,
    loadingQuestionId,
    loadSession,
    handleToggleBookmark,
    handleQuestionExpand,
    handleDeleteQuestion,
    handleSaveQuestion,
    mapExperienceToDifficulty,
  };
}
