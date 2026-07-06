import React from "react";
import { BarChart3, ArrowRight } from "lucide-react";
import ScoreRing from "./ScoreRing";

function ATSPreview({ onTriggerAuth }) {
  const cards = [
    {
      label: "Overall ATS Score",
      value: "94%",
      detail: "Excellent Match",
      ring: 94,
      color: "#4F46E5",
    },
    {
      label: "Keyword Match",
      value: "91%",
      detail: "High Density",
      ring: 91,
      color: "#14B8A6",
    },
    {
      label: "Formatting",
      value: "Excellent",
      detail: "Parse Friendly",
      textVal: true,
    },
    {
      label: "Skills Match",
      value: "89%",
      detail: "Core Match",
      ring: 89,
      color: "#14B8A6",
    },
    {
      label: "Suggestions Found",
      value: "12",
      detail: "Quick Fixes",
      alert: true,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-450 transition-colors">
            Resume ATS Analysis
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Understand exactly how recruiters and Applicant Tracking Systems
          evaluate your resume before you apply.
        </p>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                idx === 0
                  ? "col-span-2 bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-slate-800 text-white flex-row items-center gap-4"
                  : "bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850/60"
              }`}
            >
              <div>
                <p
                  className={`text-[10px] font-bold ${idx === 0 ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {item.label}
                </p>
                <p
                  className={`text-base font-extrabold tracking-tight mt-1 ${idx === 0 ? "text-white" : "text-slate-950 dark:text-white"}`}
                >
                  {item.value}
                </p>
                <span
                  className={`text-[9px] mt-0.5 block ${idx === 0 ? "text-teal-400" : item.alert ? "text-rose-500 font-bold" : "text-slate-400 dark:text-slate-550"}`}
                >
                  {item.detail}
                </span>
              </div>

              {item.ring && (
                <div className="shrink-0">
                  <ScoreRing
                    value={item.ring}
                    color={item.color}
                    size={idx === 0 ? 52 : 40}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() =>
          onTriggerAuth(
            "Analyze Your Resume with AI",
            "Create a free account to import your own resume, parse it against any job description, and view detailed ATS keyword matches.",
          )
        }
        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
      >
        Analyze My Resume <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default React.memo(ATSPreview);
