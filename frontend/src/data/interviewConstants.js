import { BrainCircuit, Briefcase, Code2, FolderOpen, Users, CheckCircle2, BookmarkCheck, Trophy } from "lucide-react";

export const CAT_CFG = {
  Technical: { icon: Code2, color: "#7C3AED", bg: "#f5f3ff" },
  Project: { icon: FolderOpen, color: "#ec4899", bg: "#fdf2f8" },
  Experience: { icon: Briefcase, color: "#3b82f6", bg: "#eff6ff" },
};

export const DIFF_CFG = {
  Easy: { color: "#10b981", bg: "#ecfdf5", border: "#10b98130" },
  Medium: { color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b30" },
  Hard: { color: "#ef4444", bg: "#fef2f2", border: "#ef444430" },
};

export const DIFF_OPTS = [
  { value: "", label: "All Difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export const CATEGORIES = Object.keys(CAT_CFG);

export const STATS_ROW = (session, answered, questions) => [
  {
    label: "Questions",
    value: questions.length,
    icon: BrainCircuit,
    color: "#7C3AED",
    bg: "#f5f3ff",
  },
  {
    label: "Easy Questions",
    value: questions.filter((q) => q.difficulty === "Easy").length,
    icon: CheckCircle2,
    color: "#10b981",
    bg: "#ecfdf5",
  },
  {
    label: "Medium & Hard",
    value: questions.filter((q) => q.difficulty === "Medium" || q.difficulty === "Hard").length,
    icon: Trophy,
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    label: "Bookmarked",
    value: questions.filter((q) => q.bookmarked).length,
    icon: BookmarkCheck,
    color: "#f59e0b",
    bg: "#fffbeb",
  },
];