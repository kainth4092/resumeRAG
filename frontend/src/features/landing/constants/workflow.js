import {
  User,
  FileText,
  BarChart3,
  MessageSquare,
  Search,
  Briefcase,
  Sparkles,
} from "lucide-react";

export const workflow = [
  {
    step: "01",
    label: "Create Your Profile",
    desc: "Tell us about your experience, skills and career goals.",
    icon: User,
    featureType: "resume-builder",
  },
  {
    step: "02",
    label: "Build or Upload Resume",
    desc: "Import your existing resume or start fresh with AI.",
    icon: FileText,
    featureType: "resume-builder",
  },
  {
    step: "03",
    label: "Optimize for ATS",
    desc: "Get instant ATS score and improvement insights.",
    icon: BarChart3,
    featureType: "ats-analysis",
  },
  {
    step: "04",
    label: "Practice Interviews",
    desc: "Practice with AI-generated role-specific questions.",
    icon: MessageSquare,
    featureType: "interview-prep",
  },
  {
    step: "05",
    label: "Discover Jobs",
    desc: "Discover matching opportunities with AI scoring.",
    icon: Search,
    featureType: "job-discovery",
  },
  {
    step: "06",
    label: "Track Applications",
    desc: "Manage every application with a visual Kanban board.",
    icon: Briefcase,
    featureType: "application-tracker",
  },
  {
    step: "07",
    label: "Land Your Next Opportunity",
    desc: "Stand out, excel in interviews, and secure your offer.",
    icon: Sparkles,
    featureType: "ai-assistant",
  },
];
