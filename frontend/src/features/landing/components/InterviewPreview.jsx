import React, { useState } from "react";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";

function InterviewPreview({ onTriggerAuth }) {
  const [selectedCat, setSelectedCat] = useState("Technical");

  const categories = [
    {
      name: "Technical",
      q: "How do you ensure state synchronization across server and client components?",
      a: "By using synchronized React Context or client hydration models with localized hooks.",
    },
    {
      name: "Behavioral",
      q: "Tell me about a time you handled conflict in a dev team.",
      a: "Discussed objective facts, established compromise, and kept delivery focus.",
    },
    {
      name: "HR",
      q: "Why do you want to join our company?",
      a: "Aligned mission, growth opportunities, and technological resonance.",
    },
    {
      name: "Coding",
      q: "Implement a throttling function with trailing edge execution.",
      a: "Using timers that store the last args and execute on cooldown expiration.",
    },
    {
      name: "Mock Interview",
      q: "Let's begin a full simulation. Introduce yourself.",
      a: "State key wins, highlight architectural impact, keep response under 2 mins.",
    },
  ];

  const activeData =
    categories.find((c) => c.name === selectedCat) || categories[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <MessageSquare size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-455 transition-colors">
            Interview Preparation
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Practice role-specific interview questions with AI-generated
          explanations and personalized feedback.
        </p>

        {/* Interactive Categories Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCat(c.name)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedCat === c.name
                  ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900"
                  : "bg-slate-50 dark:bg-slate-850/60 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Dynamic Mock Interface */}
        <div className="space-y-3 mb-6">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block mb-1">
              Active Mock Question ({selectedCat})
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              "{activeData.q}"
            </p>
          </div>
          <div className="bg-indigo-50/55 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-[9px] uppercase tracking-wider mb-1">
              <Sparkles
                size={11}
                className="fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400"
              />
              <span>AI Evaluation Guide</span>
            </div>
            <p className="text-xs text-slate-655 dark:text-slate-300 leading-relaxed">
              {activeData.a}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          onTriggerAuth(
            "Start Interview Practice Sessions",
            "Create a free account to practice with AI-generated role-specific questions and receive personalized STAR-method analysis.",
          )
        }
        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
      >
        Start Practicing <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default React.memo(InterviewPreview);
