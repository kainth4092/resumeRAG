import { useState } from "react";
import { RefreshCw, Zap, MessageSquare, Briefcase, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

export default function DashboardHeader({
  onRefresh,
  refreshing,
  greeting,
  stats,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate] = useState(() => {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  });

  const quickActions = [
    {
      icon: Zap,
      label: "Generate Resume",
      desc: "AI-powered, ATS optimized",
      color: "bg-primary",
      page: "/generator",
    },
    {
      icon: MessageSquare,
      label: "Interview Prep",
      desc:
        stats?.stats_summary?.interviews_count !== undefined
          ? `${stats.stats_summary.interviews_count} practice sessions`
          : "Start practicing",
      color: "bg-violet-600",
      page: "/interview",
    },
    {
      icon: Briefcase,
      label: "Find Jobs",
      desc:
        stats?.stats_summary?.jobs_count !== undefined
          ? `${stats.stats_summary.jobs_count} tracked jobs`
          : "Explore target roles",
      color: "bg-teal-600",
      page: "/tracker",
    },
    {
      icon: Map,
      label: "Career Roadmap",
      desc: "Optimize match skills",
      color: "bg-amber-600",
      page: "/roadmap",
    },
  ];

  const firstName = user?.name ? user.name.split(" ")[0] : "Professional";
  const displayGreeting = greeting || `Good morning, ${firstName} 👋`;

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary via-indigo-700 to-indigo-900 rounded-2xl px-7 py-6 shadow-md">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-24 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-indigo-200 text-xs font-medium mb-1">
            {currentDate}
          </p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {displayGreeting}
          </h1>
          <p className="text-indigo-200 mt-1.5 text-sm max-w-md font-medium leading-relaxed">
            {stats?.stats_summary?.ats_score > 0 ? (
              <>
                Your active ATS score is{" "}
                <strong className="text-white">
                  {stats.stats_summary.ats_score}/100
                </strong>{" "}
                ({stats.stats_summary.ats_trend}).
              </>
            ) : (
              <>
                Upload or generate your resume to calculate your first ATS
                score.
              </>
            )}{" "}
            You have{" "}
            <strong className="text-white">
              {stats?.stats_summary?.interviews_count || 0}
            </strong>{" "}
            interviews scheduled.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white hover:bg-white/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => navigate("/generator")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-bold hover:bg-white/90 active:scale-[0.97] transition-all shadow-lg cursor-pointer"
          >
            <Zap size={15} /> Generate Resume
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        {quickActions.map((qa) => (
          <button
            key={qa.label}
            onClick={() => navigate(qa.page)}
            className="flex items-center gap-3 p-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl text-left active:scale-[0.98] transition-all group cursor-pointer"
          >
            <div
              className={`w-9 h-9 rounded-xl ${qa.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
            >
              <qa.icon size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {qa.label}
              </p>
              <p className="text-[11px] text-indigo-200 truncate">{qa.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
