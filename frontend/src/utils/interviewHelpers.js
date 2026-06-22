const COMPANY_COLORS = ["#635BFF", "#5E6AD2", "#7C3AED", "#3b82f6", "#10b981", "#ec4899"];

export const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export const getTipText = (tip) => {
  if (!tip) return "";
  if (typeof tip === "string") return tip;
  return tip.content || tip.title || "";
};

export const getSampleAnswer = (answer) => {
  if (!answer) return "";
  if (typeof answer === "string") return answer;
  return answer.sample_answer || answer.answer || "";
};

const getEstimatedMinutes = (answer) => {
  const duration = typeof answer === "object" ? answer?.duration : "";
  const match = String(duration || "").match(/\d+/);
  return match ? Number(match[0]) : 4;
};

export const normalizeQuestion = (question) => ({
  ...question,
  tip: getTipText(question.tip),
  sampleAnswer: getSampleAnswer(question.answer),
  keyConcepts: question.key_points || question.keyConcepts || [],
  commonMistakes: question.common_mistakes || question.commonMistakes || [],
  followUps: question.follow_up_questions || question.followUps || [],
  estimatedMins: question.estimatedMins || getEstimatedMinutes(question.answer),
  answer: question.user_answer || "",
  evaluation: question.evaluation || null,
});

export const normalizeSession = (session) => {
  const questions = (session.questions || []).map(normalizeQuestion);
  const company = session.company || "Target Company";
  const difficulty = questions.reduce(
    (counts, question) => {
      counts[question.difficulty.toLowerCase()] += 1;
      return counts;
    },
    { easy: 0, medium: 0, hard: 0 },
  );

  return {
    ...session,
    company,
    role: session.role || "Target Role",
    companyLogo: company.charAt(0).toUpperCase(),
    logoColor: COMPANY_COLORS[session.id % COMPANY_COLORS.length],
    resumeUsed: session.resume_title || `Resume #${session.resume_id}`,
    atsScore: session.ats_score || 0,
    generatedAt: new Date(session.created_at).toLocaleString(),
    questionCount: questions.length,
    difficulty,
    status: questions.some((question) => question.answered) ? "In Progress" : "Ready",
    questions,
  };
};

export const normalizeHistory = (item) => ({
  ...item,
  logoColor: COMPANY_COLORS[item.id % COMPANY_COLORS.length],
  resumeUsed: item.resume_title || `Resume #${item.resume_id || ""}`.trim(),
  questions: item.questions_count || 0,
  avgScore: Math.round(item.avg_score || 0),
  date: new Date(item.created_at).toLocaleDateString(),
});
