import {
  Briefcase,
  CheckCircle2,
  FileText,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

const DEFAULT_TREND = [
  { month: "Jan", score: 61 },
  { month: "Feb", score: 68 },
  { month: "Mar", score: 72 },
  { month: "Apr", score: 75 },
  { month: "May", score: 81 },
  { month: "Jun", score: 88 },
];

const DEFAULT_RADAR = [
  { skill: "React", A: 90 },
  { skill: "TypeScript", A: 82 },
  { skill: "Node.js", A: 74 },
  { skill: "System Design", A: 65 },
  { skill: "Leadership", A: 58 },
  { skill: "Communication", A: 88 },
];

const DEFAULT_WEEKLY = [
  { day: "Mon", applied: 3, interviews: 0 },
  { day: "Tue", applied: 5, interviews: 1 },
  { day: "Wed", applied: 2, interviews: 2 },
  { day: "Thu", applied: 7, interviews: 1 },
  { day: "Fri", applied: 4, interviews: 3 },
  { day: "Sat", applied: 1, interviews: 0 },
  { day: "Sun", applied: 0, interviews: 1 },
];

const DEFAULT_ACTIVITIES = [
  {
    icon: Zap,
    color: "text-primary bg-primary/10",
    title: "Welcome to ResuPilot AI",
    body: "Upload or generate your first resume to get started!",
    time: "Just now",
  },
];

export const trendData = DEFAULT_TREND;
export const radarData = DEFAULT_RADAR;
export const weeklyData = DEFAULT_WEEKLY;
export const activities = DEFAULT_ACTIVITIES;

export const statCards = [
  {
    label: "ATS Average Score",
    value: 88,
    suffix: "",
    unit: "/100",
    delta: "+6 pts",
    positive: true,
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    route: "/resumes",
  },
  {
    label: "Resumes Generated",
    value: 24,
    suffix: "",
    unit: "",
    delta: "+4 this month",
    positive: true,
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    route: "/resumes",
  },
  {
    label: "Applications Tracked",
    value: 42,
    suffix: "",
    unit: "",
    delta: "+12 this week",
    positive: true,
    icon: Briefcase,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    route: "/tracker",
  },
  {
    label: "Interview Readiness",
    value: 76,
    suffix: "%",
    unit: "",
    delta: "+8% this week",
    positive: true,
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    route: "/interview",
  },
];

export function getRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function mapApiActivities(recentActivities) {
  if (!Array.isArray(recentActivities) || recentActivities.length === 0) {
    return [];
  }
  return recentActivities.map((a) => {
    let icon = Zap;
    let color = "text-primary bg-primary/10";

    if (a.type === "resume") {
      icon = FileText;
      color = "text-primary bg-primary/10";
    } else if (a.type === "job") {
      icon = Briefcase;
      color = "text-emerald-500 bg-emerald-500/10";
    } else if (a.type === "interview") {
      icon = TrendingUp;
      color = "text-amber-500 bg-amber-500/10";
    } else if (a.type === "question") {
      icon = CheckCircle2;
      color = "text-blue-500 bg-blue-500/10";
    }

    return {
      icon,
      color,
      title: a.title,
      body: a.body,
      time: getRelativeTime(a.timestamp),
    };
  });
}
