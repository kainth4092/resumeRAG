import {
  BrainCircuit,
  Code2,
  FolderOpen,
  CheckCircle2,
  Trophy,
  Atom,
  Terminal,
  Database,
  FileCode,
  Zap,
  Users,
  Palette,
  Boxes,
  Cloud,
  GitBranch,
  Coffee,
  Cpu,
  Server,
  Globe,
} from "lucide-react";

export const CAT_CFG = {
  Technical: { icon: Code2, color: "#7C3AED", bg: "#f5f3ff" },
  Behavioral: { icon: Users, color: "#3b82f6", bg: "#eff6ff" },
  Project: { icon: FolderOpen, color: "#ec4899", bg: "#fdf2f8" },
};

export const DIFF_CFG = {
  Easy: { color: "#10b981", bg: "#ecfdf5", border: "#10b98128" },
  Medium: { color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b28" },
  Hard: { color: "#ef4444", bg: "#fef2f2", border: "#ef444428" },
};

export const DIFF_OPTS = [
  { value: "", label: "All Difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

export const CATEGORIES = Object.keys(CAT_CFG);

export const STATS_ROW = (questions) => [
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
    value: questions.filter(
      (q) => q.difficulty === "Medium" || q.difficulty === "Hard",
    ).length,
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

export const CATEGORY_THEMES = {
  Technical: {
    icon: Code2,
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.15)",
  },
  Behavioral: {
    icon: Users,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.15)",
  },
  Project: {
    icon: FolderOpen,
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.08)",
    border: "rgba(236, 72, 153, 0.15)",
  },
  React: {
    icon: Atom,
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.08)",
    border: "rgba(6, 182, 212, 0.15)",
  },
  Python: {
    icon: Terminal,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.15)",
  },
  FastAPI: {
    icon: Zap,
    color: "#009688",
    bg: "rgba(0, 150, 136, 0.08)",
    border: "rgba(0, 150, 136, 0.15)",
  },
  PostgreSQL: {
    icon: Database,
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.08)",
    border: "rgba(99, 102, 241, 0.15)",
  },
  JavaScript: {
    icon: FileCode,
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.08)",
    border: "rgba(234, 179, 8, 0.15)",
  },
  TypeScript: {
    icon: FileCode,
    color: "#3178c6",
    bg: "rgba(49, 120, 198, 0.08)",
    border: "rgba(49, 120, 198, 0.15)",
  },
  CSS: {
    icon: Palette,
    color: "#1572b6",
    bg: "rgba(21, 114, 182, 0.08)",
    border: "rgba(21, 114, 182, 0.15)",
  },
  Docker: {
    icon: Boxes,
    color: "#2496ed",
    bg: "rgba(36, 150, 237, 0.08)",
    border: "rgba(36, 150, 237, 0.15)",
  },
  AWS: {
    icon: Cloud,
    color: "#ff9900",
    bg: "rgba(255, 153, 0, 0.08)",
    border: "rgba(255, 153, 0, 0.15)",
  },
  Git: {
    icon: GitBranch,
    color: "#f05032",
    bg: "rgba(240, 80, 50, 0.08)",
    border: "rgba(240, 80, 50, 0.15)",
  },
  Java: {
    icon: Coffee,
    color: "#e76f51",
    bg: "rgba(231, 111, 81, 0.08)",
    border: "rgba(231, 111, 81, 0.15)",
  },
  Node: {
    icon: Server,
    color: "#339933",
    bg: "rgba(51, 153, 51, 0.08)",
    border: "rgba(51, 153, 51, 0.15)",
  },
  HTML: {
    icon: Globe,
    color: "#e34f26",
    bg: "rgba(227, 79, 38, 0.08)",
    border: "rgba(227, 79, 38, 0.15)",
  },
  Go: {
    icon: Zap,
    color: "#00add8",
    bg: "rgba(0, 173, 216, 0.08)",
    border: "rgba(0, 173, 216, 0.15)",
  },
  Cpp: {
    icon: Cpu,
    color: "#00599c",
    bg: "rgba(0, 89, 156, 0.08)",
    border: "rgba(0, 89, 156, 0.15)",
  },
  Coding: {
    icon: Code2,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.15)",
  },
  General: {
    icon: BrainCircuit,
    color: "#6b7280",
    bg: "rgba(107, 114, 128, 0.08)",
    border: "rgba(107, 114, 128, 0.15)",
  },
};
