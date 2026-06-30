import { useState, useEffect, useRef } from "react";
import { challengeService } from "../services/challengeService";

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

  useEffect(() => {
    stateRef.current = { userAnswers, timeLeft, questions, isSubmitting };
  }, [userAnswers, timeLeft, questions, isSubmitting]);

  const startChallengeSetup = async () => {
    try {
      setLoading(true);
      setError("");
      const qData = await challengeService.getQuestions();
      if (!qData || qData.length === 0) {
        throw new Error("No questions retrieved from the database.");
      }
      setQuestions(qData);
      setUserAnswers({});
      setCurrentIdx(0);
      setTimeLeft(600);
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

  const submitTest = async () => {
    if (stateRef.current.isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersPayload = stateRef.current.questions.map((q, idx) => ({
        question_id: q.id,
        selected_option: stateRef.current.userAnswers[idx] || null,
        correct_option: q.correct_option,
        skill: q.skill
      }));

      const secondsElapsed = 600 - stateRef.current.timeLeft;
      const res = await challengeService.submitChallenge({
        answers: answersPayload,
        time_taken: secondsElapsed
      });

      setResult(res);
      setTimeTaken(secondsElapsed);
      setStep("result");
    } catch (err) {
      console.error(err);
      alert("Submission failed. We saved your results locally to review.");

      evaluateLocally();
    } finally {
      setIsSubmitting(false);
    }
  };

  const evaluateLocally = () => {
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
    const minutes = Math.floor((600 - stateRef.current.timeLeft) / 60);
    const seconds = (600 - stateRef.current.timeLeft) % 60;

    setResult({
      score: correct,
      accuracy: Math.round(accuracy * 10) / 10,
      correct,
      wrong,
      skipped,
      time_taken: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      topics_to_revise: Array.from(new Set(wrongSkills)).map(s => `${s} Focus`)
    });
    setStep("result");
  };

  useEffect(() => {
    if (step !== "test") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "test") return;

    const handleBeforeUnload = (e) => {
      submitTest();
      e.preventDefault();
      e.returnValue = "";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        submitTest();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [step]);

  const selectOption = (optLetter) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: optLetter
    }));
  };

  const getTimerColorClass = () => {
    if (timeLeft < 60) return "text-destructive animate-pulse font-bold";
    return "text-foreground font-semibold";
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
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
