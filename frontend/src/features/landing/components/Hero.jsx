import React from "react";
import { ArrowRight, Play } from "lucide-react";
import DashboardPreview from "./DashboardPreview";

function Hero({ onSignup, onTriggerAuth }) {
  const handleExplore = () => {
    document.getElementById("preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden transition-colors duration-300"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50/80 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-550/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-1/4 w-64 h-64 bg-teal-400/10 dark:bg-teal-550/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                AI-Powered Career Platform
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              Land Your Next Job with AI.{" "}
              <span className="bg-linear-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Everything You Need in One Workspace.
              </span>
            </h1>

            <p className="text-lg text-slate-655 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
              Create ATS-optimized resumes, prepare for interviews, discover
              relevant jobs, and track every application with your personal AI
              career assistant.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
              <button
                onClick={onSignup}
                className="flex items-center gap-2 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] px-7 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
              >
                Start Building for Free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={handleExplore}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Play size={14} className="text-indigo-600 dark:text-indigo-400" /> Explore the
                Platform
              </button>
            </div>
          </div>

          {/* Right — live dashboard */}
          <div className="relative lg:pl-8">
            <DashboardPreview onTriggerAuth={onTriggerAuth} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Hero);
