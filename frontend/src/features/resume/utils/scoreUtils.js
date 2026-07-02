import {
  Award,
  BookOpen,
  Briefcase,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const getScoreUtils = (analysisResult) => {
  if (!analysisResult) return [];
  return [
    {
      label: "Formatting Score",
      score: analysisResult.formatting_score || 0,
      icon: Award,
    },
    {
      label: "Skills Coverage",
      score: analysisResult.skills_coverage || 0,
      icon: BookOpen,
    },
    {
      label: "Experience Quality",
      score: analysisResult.experience_quality || 0,
      icon: Briefcase,
    },
    {
      label: "Projects Quality",
      score: analysisResult.projects_quality || 0,
      icon: Sparkles,
    },
    {
      label: "Education Quality",
      score: analysisResult.education_quality || 0,
      icon: Award,
    },
    {
      label: "Keyword Optimization",
      score: analysisResult.keyword_optimization || 0,
      icon: TrendingUp,
    },
    {
      label: "Readability Score",
      score: analysisResult.readability_score || 0,
      icon: BookOpen,
    },
    {
      label: "Grammar & Writing Quality",
      score: analysisResult.grammar_writing || 0,
      icon: CheckCircle2,
    },
    {
      label: "Section Completeness",
      score: analysisResult.section_completeness || 0,
      icon: AlertCircle,
    },
    {
      label: "Recruiter Readiness",
      score: analysisResult.recruiter_readiness || 0,
      icon: Briefcase,
    },
  ];
};
