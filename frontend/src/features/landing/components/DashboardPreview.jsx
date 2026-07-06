import { useState } from "react";
import {
  Zap,
  Sparkles,
  Search,
  Bell,
  ChevronRight,
  FileText,
  MessageSquare,
  Briefcase,
  Award,
} from "lucide-react";
import ScoreRing from "./ScoreRing";

export default function DashboardPreview({ onTriggerAuth }) {
  const [selectedMetric, setSelectedMetric] = useState("Resume");
  const [showNotifications, setShowNotifications] = useState(false);

  const metrics = [
    {
      id: "Resume",
      label: "Resume Score",
      value: "94%",
      detail: "Stripe Resume Optimized",
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      ringVal: 94,
    },
    {
      id: "Interview",
      label: "Interview Readiness",
      value: "87%",
      detail: "14 questions prepared",
      icon: MessageSquare,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/30",
      ringVal: 87,
    },
    {
      id: "Profile",
      label: "Profile Completion",
      value: "92%",
      detail: "Skills section complete",
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      ringVal: 92,
    },
    {
      id: "Applications",
      label: "Applications",
      value: "18",
      detail: "4 interviews scheduled",
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      id: "Jobs",
      label: "Recommended Jobs",
      value: "27",
      detail: "9 new matches today",
      icon: Search,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      id: "Suggestions",
      label: "AI Suggestions",
      value: "12",
      detail: "6 high priority action items",
      icon: Sparkles,
      color: "text-rose-600 dark:text-rose-455",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  const handleDeepAction = (actionName) => {
    onTriggerAuth(
      `Access Jordan's ${actionName}`,
      `Create a free account to import your own career data, manage applications, and unlock direct dashboard access.`,
    );
  };

  return (
    <div className="relative animate-in fade-in-50 slide-in-from-bottom-6 duration-700">
      {/* Background glow */}
      <div className="absolute -inset-4 bg-linear-to-r from-indigo-500/15 via-teal-500/10 to-indigo-500/15 rounded-3xl blur-2xl pointer-events-none" />

      {/* Main preview window */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-105"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Window Chrome Header */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 select-none">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4 h-6 bg-slate-100/80 dark:bg-slate-900 rounded-md border border-slate-200/50 dark:border-slate-800/50 flex items-center px-3 justify-center md:justify-start">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              app.resupilot.ai/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard Frame */}
        <div className="flex h-[420px] relative">
          {/* Interactive Sidebar */}
          <div className="w-[125px] bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col py-4 px-2 shrink-0 select-none">
            <div className="flex items-center gap-2 px-1.5 mb-5">
              <div className="w-5.5 h-5.5 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30">
                <Zap size={11} className="text-white fill-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-900 dark:text-white tracking-tight">
                ResuPilot AI
              </span>
            </div>

            <div className="space-y-0.5">
              {[
                { label: "Dashboard", icon: Zap },
                { label: "Resumes", icon: FileText },
                { label: "Interviews", icon: MessageSquare },
                { label: "Jobs", icon: Search },
                { label: "Tracker", icon: Briefcase },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleDeepAction(item.label)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors cursor-pointer text-left text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                >
                  <item.icon
                    size={11}
                    className="text-slate-450 dark:text-slate-505"
                  />
                  <span className="text-[9px] truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-4 overflow-hidden flex flex-col">
            {/* Top Bar Mock */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 relative">
              <div>
                <h5 className="text-[11px] font-bold text-slate-900 dark:text-white">
                  Welcome back, Jordan 👋
                </h5>
                <p className="text-[8px] text-slate-400 dark:text-slate-500">
                  ResuPilot copilot recommendations updated 2m ago.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="w-6 h-6 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer bg-transparent border-none"
                >
                  <Bell size={12} />
                </button>
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-teal-500 text-white font-bold text-[8px] flex items-center justify-center shadow-xs">
                  JD
                </div>
              </div>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 text-[8px] space-y-1.5 animate-in fade-in duration-100">
                  <p className="font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-1">
                    Notifications
                  </p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <p className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                      ✓ ATS Score updated for Stripe Resume
                    </p>
                    <p className="p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-medium">
                      ⚠ 3 pending interview questions await review
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Render views depending on sidebar activeTab */}
            <>
              {/* 6 Grid Metrics (Fully Interactive) */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {metrics.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMetric(m.id)}
                    className={`relative text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedMetric === m.id
                        ? "bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-slate-800 text-white shadow-md scale-[1.02]"
                        : "bg-slate-50/50 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-955 border-slate-100 dark:border-slate-850/60 hover:border-slate-200 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[8px] font-medium ${selectedMetric === m.id ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}
                      >
                        {m.label}
                      </span>
                      <m.icon
                        size={11}
                        className={
                          selectedMetric === m.id
                            ? "text-teal-400"
                            : "text-slate-400 dark:text-slate-500"
                        }
                      />
                    </div>
                    <div className="text-sm font-extrabold tracking-tight text-slate-700 dark:text-white group-hover:text-indigo-600">
                      {m.value}
                    </div>
                    <p
                      className={`text-[7px] mt-0.5 truncate ${selectedMetric === m.id ? "text-slate-300" : "text-slate-400 dark:text-slate-500"}`}
                    >
                      {m.detail}
                    </p>
                  </button>
                ))}
              </div>

              {/* Interactive Dynamic Detail Panel */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl p-3 overflow-hidden flex flex-col justify-between">
                {selectedMetric === "Resume" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText
                          size={12}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          Resume Optimization Breakdown
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                        PASSED ATS
                      </span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <ScoreRing value={94} color="#4F46E5" size={48} />
                      <div className="space-y-1">
                        <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">
                          Perfect Score Match
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {[
                            "React 19",
                            "TailwindCSS",
                            "TypeScript",
                            "Node.js",
                          ].map((kw) => (
                            <span
                              key={kw}
                              className="text-[7px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 px-1 py-0.2 rounded font-medium"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedMetric === "Interview" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare
                          size={12}
                          className="text-teal-600 dark:text-teal-400"
                        />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          Interview Readiness
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-455 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded">
                        READY
                      </span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <ScoreRing value={87} color="#14B8A6" size={48} />
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                          Behavioral: 92% | Coding: 81%
                        </p>
                        <p className="text-[8px] text-slate-500 dark:text-slate-400">
                          Practice custom tailored mock interviews matching
                          Netflix standard.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {selectedMetric === "Profile" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Award size={12} className="text-amber-500" />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          Profile Completion
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <ScoreRing value={92} color="#F59E0B" size={48} />
                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: "92%" }}
                          />
                        </div>
                        <p className="text-[8px] text-slate-500 dark:text-slate-400">
                          Add 1 project link to hit 100% complete profile
                          rating.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {selectedMetric === "Applications" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Briefcase
                          size={12}
                          className="text-emerald-600 dark:text-emerald-450"
                        />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          Pipeline Tracking Overview
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        <p className="text-[12px] font-black text-slate-800 dark:text-white">
                          10
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-500 uppercase">
                          Applied
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        <p className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">
                          4
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-505 uppercase">
                          Interviewing
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                        <p className="text-[12px] font-black text-teal-600 dark:text-teal-400">
                          2
                        </p>
                        <p className="text-[7px] text-slate-400 dark:text-slate-505 uppercase">
                          Offers
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {selectedMetric === "Jobs" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Search
                          size={12}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          Recommended Opportunities
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                        <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200">
                          Stripe · Senior Software Engineer
                        </span>
                        <span className="text-[7px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 rounded">
                          96% MATCH
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-850 flex justify-between items-center">
                        <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200">
                          Linear · Frontend Engineer
                        </span>
                        <span className="text-[7px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 rounded">
                          91% MATCH
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {selectedMetric === "Suggestions" && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles
                          size={12}
                          className="text-rose-600 dark:text-rose-455"
                        />
                        <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                          AI Priority Action Items
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-[8px] text-slate-655 dark:text-slate-350">
                      <p className="flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-rose-500" />{" "}
                        Replace general verbs with measurable metrics on Stripe
                        Resume.
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <span className="w-1 h-1 rounded-full bg-rose-500" />{" "}
                        Review the 3 suggested answers for the Netflix
                        leadership role.
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800 mt-2 text-[8px] text-slate-400 dark:text-slate-500">
                  <span>
                    Click on any card above to view real-time recommendations.
                  </span>
                  <button
                    onClick={() => handleDeepAction(selectedMetric)}
                    className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Quick Optimize <ChevronRight size={8} />
                  </button>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
