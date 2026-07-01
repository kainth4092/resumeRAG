import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { mockInterviewService } from "../../services/mockInterviewService";
import { InterviewTypeSelector } from "./InterviewTypeSelector";
import { QuestionScreen } from "./QuestionScreen";
import { FinalReport } from "./FinalReport";

export function AIMockInterview() {
  const [view, setView] = useState("categories"); // categories, active, report
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await mockInterviewService.getHistory();
      setHistory(res.history || []);
    } catch (err) {
      console.error("Failed to load mock interview history:", err);
    }
  };

  const handleStartInterview = async (type) => {
    setLoading(true);
    setLoadingMsg("Setting up your interview session...");
    setError("");
    setSelectedType(type);
    setCurrentIndex(0);
    setAnswers([]);
    setStartTime(Date.now());

    try {
      const res = await mockInterviewService.getQuestions(type);
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setView("active");
      } else {
        setError(
          "Could not retrieve mock questions from the bank. Please try again.",
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch questions. Please check your network connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerCompleted = (answerData) => {
    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions
      finishInterview(updatedAnswers);
    }
  };

  const handleSkipQuestion = () => {
    const skippedAnswer = {
      question_id: questions[currentIndex].id,
      question_text: questions[currentIndex].question,
      transcript: "Skipped.",
      answer_duration: 0,
    };

    const updatedAnswers = [...answers, skippedAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishInterview(updatedAnswers);
    }
  };

  const finishInterview = async (completedAnswers) => {
    setLoading(true);
    setLoadingMsg(
      "Evaluating your answers & generating comprehensive report...",
    );
    const duration = Math.round((Date.now() - startTime) / 1000); // in seconds

    try {
      // 1. Call batch evaluation endpoint
      const evalPayload = completedAnswers.map((ans) => ({
        question_text: ans.question_text,
        transcript: ans.transcript,
      }));

      const evaluationResult =
        await mockInterviewService.evaluateInterview(evalPayload);

      // 2. Format detailed answers list
      const finalAnswers = completedAnswers.map((ans, idx) => {
        const evalAns =
          (evaluationResult.answers && evaluationResult.answers[idx]) || {};
        return {
          question_id: ans.question_id,
          question_text: ans.question_text,
          transcript: ans.transcript,
          answer_duration: ans.answer_duration,
          overall_score: evalAns.overall_score || 0,
          technical_score: evalAns.technical_score || 0,
          communication_score: evalAns.communication_score || 0,
          confidence_score: evalAns.confidence_score || 0,
          grammar_score: evalAns.grammar_score || 0,
          clarity_score: evalAns.clarity_score || 0,
          strengths: evalAns.strengths || [],
          weaknesses: evalAns.weaknesses || [],
          improvements: evalAns.improvements || [],
          missing_points: evalAns.missing_points || [],
          ideal_answer: evalAns.ideal_answer || "",
        };
      });

      const reportData = {
        interview_type: selectedType,
        duration: duration,
        overall_score: evaluationResult.overall_score || 0,
        questions_attempted: completedAnswers.length,
        performance_summary:
          evaluationResult.performance_summary ||
          "Completed mock interview session.",
        answers: finalAnswers,
      };

      // 3. Save session to database
      const res = await mockInterviewService.saveSession(reportData);

      const savedReport = {
        ...reportData,
        id: res.session_id,
        created_at: new Date().toISOString(),
      };

      setActiveReport(savedReport);
      setView("report");
      fetchHistory(); // refresh history
    } catch (err) {
      console.error("Failed to complete interview evaluation:", err);
      setError(
        "Failed to generate report from evaluation service. Fallback loaded.",
      );

      // Fallback local report construction so user doesn't lose progress
      const fallbackAnswers = completedAnswers.map((ans) => ({
        question_id: ans.question_id,
        question_text: ans.question_text,
        transcript: ans.transcript,
        answer_duration: ans.answer_duration,
        overall_score: 60,
        technical_score: 55,
        communication_score: 65,
        confidence_score: 60,
        grammar_score: 70,
        clarity_score: 60,
        strengths: ["Completed attempt."],
        weaknesses: ["AI service error."],
        improvements: ["Check local services."],
        missing_points: [],
        ideal_answer: "",
      }));

      const fallbackReport = {
        interview_type: selectedType,
        duration: duration,
        overall_score: 60,
        questions_attempted: completedAnswers.length,
        performance_summary:
          "Interview completed. Score is estimation due to evaluation service unavailability.",
        answers: fallbackAnswers,
        created_at: new Date().toISOString(),
      };

      setActiveReport(fallbackReport);
      setView("report");
    } finally {
      setLoading(false);
    }
  };

  const handleReopenHistory = (session) => {
    setActiveReport(session);
    setView("report");
  };

  const handleBackToCategories = () => {
    setView("categories");
    setActiveReport(null);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 size={36} className="text-primary animate-spin" />
        <p className="text-xs font-bold text-foreground">{loadingMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button when in active interview or report */}
      {view !== "categories" && (
        <div>
          <button
            onClick={handleBackToCategories}
            className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft size={13} /> Back to Mock Categories
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0 duration-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {view === "categories" && (
        <InterviewTypeSelector
          onSelect={handleStartInterview}
          history={history}
          onReopenHistory={handleReopenHistory}
        />
      )}

      {view === "active" && questions.length > 0 && (
        <QuestionScreen
          question={questions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswerCompleted={handleAnswerCompleted}
          onSkip={handleSkipQuestion}
        />
      )}

      {view === "report" && activeReport && (
        <FinalReport
          report={activeReport}
          onRetake={() => handleStartInterview(activeReport.interview_type)}
        />
      )}
    </div>
  );
}
export default AIMockInterview;
