import { Code2, Users, Briefcase, BrainCircuit, FolderOpen } from "lucide-react";

export const CAT_CFG = {
    Technical: { icon: Code2, color: "#7C3AED", bg: "#f5f3ff" },
    Behavioral: { icon: Users, color: "#3b82f6", bg: "#eff6ff" },
    HR: { icon: Briefcase, color: "#10b981", bg: "#ecfdf5" },
    Coding: { icon: BrainCircuit, color: "#f59e0b", bg: "#fffbeb" },
    Project: { icon: FolderOpen, color: "#ec4899", bg: "#fdf2f8" },
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
