import {
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    title: "Workspace",
    items: [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        badge: null,
      },
      { id: "resumes", icon: FileText, label: "Resume", badge: null },
      { id: "analysis", icon: Sparkles, label: "Resume Analysis", badge: "AI" },
    ],
  },
  {
    title: "Jobs",
    items: [
      { id: "tracker", icon: Briefcase, label: "Job Tracker", badge: "12" },
      {
        id: "interview",
        icon: MessageSquare,
        label: "Interview Prep",
        badge: null,
      },
    ],
  },
];
