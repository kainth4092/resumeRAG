import {
  Clock,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  MessageSquareText,
} from "lucide-react";

export function FinalReport({ report, onRetake }) {
  const {
    interview_type,
    created_at,
    duration,
    overall_score = 0,
    questions_attempted,
    performance_summary,
    evaluation_status,
    answers = [],
  } = report;

  const isEvaluationUnavailable =
    evaluation_status === "unavailable";

  const safeOverallScore = Math.max(
    0,
    Math.min(100, Number(overall_score) || 0),
  );

  const getAverage = (key) => {
    if (answers.length === 0) return 0;

    const sum = answers.reduce(
      (total, answer) =>
        total + (Number(answer?.[key]) || 0),
      0,
    );

    return Math.round(sum / answers.length);
  };

  const avgComm = getAverage("communication_score");
  const avgTech = getAverage("technical_score");
  const avgConf = getAverage("confidence_score");
  const avgClarity = getAverage("clarity_score");
  const avgGrammar = getAverage("grammar_score");

  const getGrade = (score) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  const overallGrade =
    isEvaluationUnavailable
      ? "N/A"
      : getGrade(safeOverallScore);

  const dateStr = created_at
    ? new Date(created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  const formatDuration = (seconds) => {
    const totalSeconds =
      Number(seconds) || 0;

    if (totalSeconds <= 0) return "0s";

    const minutes = Math.floor(
      totalSeconds / 60,
    );

    const remainingSeconds =
      totalSeconds % 60;

    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const answeredCount = answers.filter(
    (answer) =>
      String(
        answer?.transcript || "",
      ).trim().length > 0,
  ).length;

  const skippedCount = Math.max(
    0,
    answers.length - answeredCount,
  );

  const renderList = (
    items,
    emptyMessage,
  ) => {
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return (
        <p className="text-xs text-muted-foreground">
          {emptyMessage}
        </p>
      );
    }

    return (
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="text-xs text-muted-foreground flex gap-2 leading-relaxed"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
            Mock Interview Assessment
          </span>

          <h2 className="text-xl font-bold text-foreground mt-2">
            {interview_type} Report
          </h2>

          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Completed on {dateStr}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(duration)} duration
            </span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <ClipboardList size={11} />

              {answers.length > 0
                ? `${answeredCount} Answered • ${skippedCount} Skipped`
                : `${questions_attempted || 0} Questions Completed`}
            </span>
          </div>
        </div>

        <button
          onClick={onRetake}
          className="h-10 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          Retake Interview
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="relative w-28 h-28 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-primary leading-none">
              {overallGrade}
            </span>

            <span className="text-[11px] font-bold text-muted-foreground mt-1">
              {isEvaluationUnavailable
                ? "Score unavailable"
                : `Score: ${safeOverallScore}%`}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-bold text-foreground">
              {isEvaluationUnavailable
                ? "Evaluation Unavailable"
                : "Overall Performance Grade"}
            </h3>

            <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
              {performance_summary ||
                "Successfully completed the simulated interview session."}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2 space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-foreground">
            Core Interview Metrics
          </h4>

          <div className="space-y-3.5">
            {[
              {
                label:
                  "Technical Knowledge",
                value: avgTech,
              },
              {
                label:
                  "Communication Skill",
                value: avgComm,
              },
              {
                label:
                  "Confidence & Pitch",
                value: avgConf,
              },
              {
                label:
                  "Clarity & Structure",
                value: avgClarity,
              },
              {
                label:
                  "Grammar & Accuracy",
                value: avgGrammar,
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="space-y-1"
              >
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-muted-foreground">
                    {metric.label}
                  </span>

                  <span className="text-foreground">
                    {metric.value}%
                  </span>
                </div>

                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          metric.value,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Feedback */}
      {answers.length > 0 && (
        <section className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Individual Question Feedback
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              Review your answer, scores,
              improvement areas, and a stronger
              response for every question.
            </p>
          </div>

          <div className="space-y-5">
            {answers.map(
              (answer, index) => {
                const transcript = String(
                  answer?.transcript || "",
                ).trim();

                const isSkipped =
                  transcript.length === 0;

                const answerScore =
                  Number(
                    answer?.overall_score,
                  ) || 0;

                return (
                  <article
                    key={
                      answer?.question_id ||
                      `${answer?.question_text}-${index}`
                    }
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="p-5 border-b border-border bg-muted/20">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                            Question {index + 1}
                          </span>

                          <h4 className="text-sm font-bold text-foreground mt-1 leading-relaxed">
                            {answer?.question_text ||
                              "Question unavailable"}
                          </h4>
                        </div>

                        <div className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-center">
                          <p className="text-lg font-black text-primary leading-none">
                            {answerScore}%
                          </p>

                          <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">
                            Score
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquareText
                            size={15}
                            className="text-primary"
                          />

                          <h5 className="text-xs font-bold text-foreground">
                            Your Answer
                          </h5>
                        </div>

                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p
                            className={`text-xs leading-relaxed ${
                              isSkipped
                                ? "italic text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {isSkipped
                              ? "This question was skipped."
                              : transcript}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          {
                            label:
                              "Technical",
                            value:
                              answer?.technical_score,
                          },
                          {
                            label:
                              "Communication",
                            value:
                              answer?.communication_score,
                          },
                          {
                            label:
                              "Confidence",
                            value:
                              answer?.confidence_score,
                          },
                          {
                            label:
                              "Clarity",
                            value:
                              answer?.clarity_score,
                          },
                          {
                            label:
                              "Grammar",
                            value:
                              answer?.grammar_score,
                          },
                        ].map((score) => (
                          <div
                            key={score.label}
                            className="rounded-xl border border-border p-3 text-center"
                          >
                            <p className="text-base font-black text-primary">
                              {Number(
                                score.value,
                              ) || 0}
                              %
                            </p>

                            <p className="text-[9px] font-semibold text-muted-foreground mt-1">
                              {score.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2
                              size={15}
                              className="text-primary"
                            />

                            <h5 className="text-xs font-bold text-foreground">
                              Strengths
                            </h5>
                          </div>

                          {renderList(
                            answer?.strengths,
                            isSkipped
                              ? "No strengths were identified because the question was skipped."
                              : "No specific strengths were provided.",
                          )}
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle
                              size={15}
                              className="text-primary"
                            />

                            <h5 className="text-xs font-bold text-foreground">
                              Weaknesses
                            </h5>
                          </div>

                          {renderList(
                            answer?.weaknesses,
                            "No specific weaknesses were provided.",
                          )}
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Target
                              size={15}
                              className="text-primary"
                            />

                            <h5 className="text-xs font-bold text-foreground">
                              Missing Points
                            </h5>
                          </div>

                          {renderList(
                            answer?.missing_points,
                            "No missing points were identified.",
                          )}
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb
                              size={15}
                              className="text-primary"
                            />

                            <h5 className="text-xs font-bold text-foreground">
                              How to Improve
                            </h5>
                          </div>

                          {renderList(
                            answer?.improvements,
                            "No additional improvements were provided.",
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb
                            size={15}
                            className="text-primary"
                          />

                          <h5 className="text-xs font-bold text-foreground">
                            Ideal Answer
                          </h5>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {answer?.ideal_answer ||
                            "An ideal answer was not generated for this question."}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </section>
      )}
    </div>
  );
}
