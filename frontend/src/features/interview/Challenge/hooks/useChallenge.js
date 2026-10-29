import { useState, useEffect, useRef, useCallback } from "react";
import { challengeService } from "../services/challengeService";
import { toast } from "sonner";

export function useChallenge() {
  const [step, setStep] = useState("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(600);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const stateRef = useRef({ userAnswers, timeLeft, questions, isSubmitting });
  const attemptIdRef = useRef(null);
  const timeLimitRef = useRef(600);
  const startTimeRef = useRef(null);
  const tabSwitchWarningsRef = useRef(0);

  useEffect(() => {
    stateRef.current = { userAnswers, timeLeft, questions, isSubmitting };
  }, [userAnswers, timeLeft, questions, isSubmitting]);

  const startChallengeSetup = async () => {
    try {
      setLoading(true);
      setError("");
      const qData = await challengeService.getQuestions();
      const questionList = Array.isArray(qData) ? qData : qData.questions || [];
      if (!questionList || questionList.length === 0) {
        throw new Error("No questions retrieved from the database.");
      }

      attemptIdRef.current = qData.attempt_id || null;
      timeLimitRef.current = qData.time_limit_seconds || 600;
      startTimeRef.current = Date.now();
      tabSwitchWarningsRef.current = 0;

      // Transform backend options format if necessary
      const formatted = questionList.map((q) => {
        const options = q.options || [
          q.option_a || "Option A",
          q.option_b || "Option B",
          q.option_c || "Option C",
          q.option_d || "Option D",
        ];
        return {
          ...q,
          options,
        };
      });

      setQuestions(formatted);
      setUserAnswers({});
      setCurrentIdx(0);
      setTimeLeft(timeLimitRef.current);
      setTimeTaken(0);
      setStep("test");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load challenge questions.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateLocally = useCallback(() => {
    const total = stateRef.current.questions.length;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const wrongSkills = [];

    stateRef.current.questions.forEach((q, idx) => {
      const ans = stateRef.current.userAnswers[idx];
      if (!ans) {
        skipped++;
      } else if (ans === q.correct_option) {
        correct++;
      } else {
        wrong++;
        if (q.skill) {
          wrongSkills.push(q.skill);
        }
      }
    });

    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const elapsedSeconds = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : timeLimitRef.current - stateRef.current.timeLeft;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    setResult({
      score: correct,
      accuracy: Math.round(accuracy * 10) / 10,
      correct,
      wrong,
      skipped,
      total_questions: total,
      time_taken: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      topics_to_revise: Array.from(new Set(wrongSkills)).map((s) => `${s} Focus`),
    });
    setStep("result");
  }, []);

  const submitTest = useCallback(async () => {
    if (stateRef.current.isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersPayload = stateRef.current.questions.map((q, idx) => ({
        question_id: q.id,
        selected_option: stateRef.current.userAnswers[idx] || null,
        correct_option: q.correct_option,
        skill: q.skill,
      }));

      const elapsedSeconds = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : timeLimitRef.current - stateRef.current.timeLeft;

      const payload = {
        answers: answersPayload,
        time_taken: elapsedSeconds,
      };

      if (attemptIdRef.current) {
        payload.attempt_id = attemptIdRef.current;
      }

      const res = await challengeService.submitChallenge(payload);

      setResult(res);
      setTimeTaken(elapsedSeconds);
      setStep("result");
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. We saved your results locally to review.");
      evaluateLocally();
    } finally {
      setIsSubmitting(false);
    }
  }, [evaluateLocally]);

  // Server-driven real-time clock synced with startTimeRef
  useEffect(() => {
    if (step !== "test") return;

    const timer = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, timeLimitRef.current - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        submitTest();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [step, submitTest]);

  // Monitor visibility and tab-switching with warning before auto-submission
  useEffect(() => {
    if (step !== "test") return;

    const handleBeforeUnload = (e) => {
      submitTest();
      e.preventDefault();
      e.returnValue = "";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (tabSwitchWarningsRef.current === 0) {
          tabSwitchWarningsRef.current = 1;
          toast.warning(
            "⚠️ Tab Switch Detected: Leaving the challenge tab again will result in automatic submission!",
            { duration: 6000 }
          );
        } else {
          toast.error("Multiple tab switches detected. Auto-submitting test.");
          submitTest();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [step, submitTest]);

  const selectOption = (optLetter) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optLetter,
    }));
  };

  const getTimerColorClass = () => {
    if (timeLeft < 60) return "text-destructive animate-pulse font-bold";
    return "text-foreground font-semibold";
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    step,
    setStep,
    loading,
    error,
    setError,
    questions,
    currentIdx,
    setCurrentIdx,
    userAnswers,
    timeLeft,
    timeTaken,
    isSubmitting,
    result,
    showModal,
    setShowModal,
    startChallengeSetup,
    submitTest,
    selectOption,
    getTimerColorClass,
    formatTime,
  };
}
