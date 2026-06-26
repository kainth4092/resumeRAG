import { Briefcase, CheckCircle2, FileText, Star, Target, TrendingUp, Upload, Zap } from "lucide-react";

export const statCards = [
    { label: "ATS Average Score", value: 88, suffix: "", unit: "/100", delta: "+6 pts", positive: true, icon: Star, color: "text-primary", bg: "bg-primary/10", route: "analytics" },
    { label: "Resumes Generated", value: 24, suffix: "", unit: "", delta: "+4 this month", positive: true, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", route: "resumes" },
    { label: "Applications Tracked", value: 42, suffix: "", unit: "", delta: "+12 this week", positive: true, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10", route: "tracker" },
    { label: "Interview Readiness", value: 76, suffix: "%", unit: "", delta: "+8% this week", positive: true, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", route: "interview" },
];

export const trendData = [
    { month: "Jan", score: 61 }, { month: "Feb", score: 68 }, { month: "Mar", score: 72 },
    { month: "Apr", score: 75 }, { month: "May", score: 81 }, { month: "Jun", score: 88 },
];

export const radarData = [
    { skill: "React", A: 90 }, { skill: "TypeScript", A: 82 },
    { skill: "Node.js", A: 74 }, { skill: "System Design", A: 65 },
    { skill: "Leadership", A: 58 }, { skill: "Communication", A: 88 },
];

export const weeklyData = [
    { day: "Mon", applied: 3, interviews: 0 }, { day: "Tue", applied: 5, interviews: 1 },
    { day: "Wed", applied: 2, interviews: 2 }, { day: "Thu", applied: 7, interviews: 1 },
    { day: "Fri", applied: 4, interviews: 3 }, { day: "Sat", applied: 1, interviews: 0 },
    { day: "Sun", applied: 0, interviews: 1 },
];

export const activities = [
    { icon: Zap, color: "text-primary bg-primary/10", title: "Resume Generated", body: "Stripe Senior Frontend Engineer", time: "2m ago" },
    { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", title: "Application Submitted", body: "Notion — Product Designer", time: "1h ago" },
    { icon: TrendingUp, color: "text-blue-500 bg-blue-500/10", title: "ATS Score Improved", body: "94/100 on Stripe resume", time: "3h ago" },
    { icon: Upload, color: "text-amber-500 bg-amber-500/10", title: "Resume Uploaded", body: "Software_Engineer_2024.pdf", time: "5h ago" },
    { icon: Star, color: "text-purple-500 bg-purple-500/10", title: "Interview Scheduled", body: "Linear — Final Round", time: "1d ago" },
    { icon: Target, color: "text-red-500 bg-red-500/10", title: "Skill Gap Detected", body: "Kubernetes missing in 8 JDs", time: "2d ago" },
];