import { BarChart3, Briefcase, FileText, LayoutDashboard, LayoutTemplate, Map, MessageSquare, Settings, User, Zap } from "lucide-react";

export const NAV_SECTIONS = [
    {
        title: "Workspace",
        items: [
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
            { id: "generator", icon: Zap, label: "Generator", badge: "New" },
            { id: "resumes", icon: FileText, label: "My Resumes", badge: null },
            { id: "profile", icon: User, label: "Profile Data", badge: null },
            { id: "templates", icon: LayoutTemplate, label: "Templates", badge: null },
        ],
    },
    {
        title: "Jobs",
        items: [
            { id: "tracker", icon: Briefcase, label: "Job Tracker", badge: "12" },
            { id: "interview", icon: MessageSquare, label: "Interview Prep", badge: null },
        ],
    },
    {
        title: "Insights",
        items: [
            { id: "settings", icon: Settings, label: "Settings", badge: null },
        ],
    },
];

export const notifications = [
    { id: 1, title: "ATS Score improved to 94", body: "Software Engineer resume — Stripe", time: "2m ago", unread: true, icon: "📈" },
    { id: 2, title: "New job match found", body: "Senior Frontend Dev at Vercel · 91% match", time: "45m ago", unread: true, icon: "💼" },
    { id: 3, title: "Interview scheduled", body: "Linear · Final round · Tomorrow 3pm", time: "2h ago", unread: false, icon: "🗓️" },
    { id: 4, title: "Resume generated", body: "Notion Product Engineer v2", time: "5h ago", unread: false, icon: "✨" },
];