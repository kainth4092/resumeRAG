import React, { useState } from "react";
import { Briefcase, ArrowRight, Plus } from "lucide-react";

function JobTrackerPreview({ onTriggerAuth }) {
  const [activeBoard, setActiveBoard] = useState("Applied");

  const pipeline = [
    {
      label: "Saved",
      count: 8,
      jobs: ["OpenAI - Tech Lead", "Linear - Fullstack Eng"],
    },
    {
      label: "Applied",
      count: 12,
      jobs: ["Stripe - Front-end Eng", "Vercel - UX Architect"],
    },
    { label: "Assessment", count: 2, jobs: ["Duolingo - SWE II"] },
    { label: "Interview", count: 3, jobs: ["Netflix - Staff Engineer"] },
    { label: "Offer", count: 1, jobs: ["Apple - React Engineer"] },
  ];

  const handleAction = () => {
    onTriggerAuth(
      "Track Applications & Jobs",
      "Create a free account to build a customized Kanban tracker board, set key interview deadlines, and save matched listings.",
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border rounded-2xl border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Briefcase size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-455 transition-colors">
            Application Tracker
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Stay organized throughout your job search with an intelligent
          application pipeline.
        </p>

        {/* Pipeline horizontal bar selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none select-none">
          {pipeline.map((stage) => (
            <button
              key={stage.label}
              onClick={() => setActiveBoard(stage.label)}
              className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeBoard === stage.label
                  ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900"
                  : "bg-slate-50 dark:bg-slate-850/60 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              }`}
            >
              <span>{stage.label}</span>
              <span
                className={`text-[8px] font-semibold px-1 rounded ${
                  activeBoard === stage.label
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-750 text-slate-650 dark:text-slate-350"
                }`}
              >
                {stage.count}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Board Card list */}
        <div className="space-y-2 mb-6">
          {(pipeline.find((p) => p.label === activeBoard)?.jobs || []).map(
            (job, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100/60 dark:border-slate-850/60 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {job.split(" - ")[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {job.split(" - ")[1]}
                  </p>
                </div>
                <span
                  className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    activeBoard === "Offer"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      : activeBoard === "Rejected"
                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-455"
                        : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {activeBoard}
                </span>
              </div>
            ),
          )}
          <button
            onClick={handleAction}
            className="w-full border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer bg-transparent"
          >
            <Plus size={12} /> Add New Job Application
          </button>
        </div>
      </div>

      <button
        onClick={handleAction}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
      >
        Track Applications <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default React.memo(JobTrackerPreview);
