import { Zap, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import ScoreRing from "./ScoreRing";

export default function DashboardPreview({ onTriggerAuth }) {
  const trendData = [
    { v: 62 },
    { v: 68 },
    { v: 71 },
    { v: 75 },
    { v: 80 },
    { v: 85 },
    { v: 91 },
  ];

  const handleDeepAction = (actionName) => {
    if (onTriggerAuth) {
      onTriggerAuth(
        `Access Jordan's ${actionName}`,
        `Create a free account to import your own career data, manage applications, and unlock direct dashboard access.`,
      );
    }
  };

  return (
    <div className="relative">
      {/* Glow effects */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-teal-500/15 to-indigo-500/20 rounded-3xl blur-2xl dark:from-indigo-550/10 dark:via-teal-550/5 dark:to-indigo-550/10 pointer-events-none" />

      {/* Main preview window */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="flex-1 mx-3 h-5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center px-2">
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              app.resupilot.ai/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex" style={{ height: 380 }}>
          {/* Mini sidebar */}
          <div className="w-[120px] bg-white dark:bg-slate-950/60 border-r border-slate-100 dark:border-slate-850 flex flex-col py-3 px-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-1 mb-4">
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Zap size={10} className="text-white" />
              </div>
              <span className="text-[9px] font-bold text-slate-800 dark:text-white">
                ResuPilot
              </span>
            </div>
            {[
              { label: "Dashboard", active: true },
              { label: "Resume" },
              { label: "Interview" },
              { label: "Jobs" },
              { label: "Tracker" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleDeepAction(item.label)}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-0.5 text-left transition-colors cursor-pointer ${
                  item.active
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.active
                      ? "bg-indigo-600 dark:bg-indigo-400"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
                <span className="text-[9px] font-medium truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 p-3 overflow-hidden">
            {/* Greeting */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-white">
                  Good morning, Jordan 👋
                </p>
                <p className="text-[8px] text-slate-500 dark:text-slate-400">
                  Your career workspace is ready
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-indigo-700 dark:text-indigo-400">
                    JD
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[
                {
                  label: "ATS Score",
                  value: "91%",
                  color: "text-indigo-600 dark:text-indigo-400",
                  bg: "bg-indigo-50 dark:bg-indigo-950/30",
                },
                {
                  label: "Resumes",
                  value: "6",
                  color: "text-teal-600 dark:text-teal-400",
                  bg: "bg-teal-50 dark:bg-teal-950/30",
                },
                {
                  label: "Applied",
                  value: "24",
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/30",
                },
                {
                  label: "Interview",
                  value: "4",
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/30",
                },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleDeepAction(s.label)}
                  className="bg-white dark:bg-slate-950/80 rounded-xl p-2 border border-slate-100 dark:border-slate-850 text-left hover:border-slate-200 dark:hover:border-slate-800 transition-colors cursor-pointer"
                >
                  <div className={`text-[10px] font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {s.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Chart + rings row */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {/* Area chart */}
              <div className="col-span-2 min-w-0 bg-white dark:bg-slate-950/80 rounded-xl p-2 border border-slate-100 dark:border-slate-850">
                <p className="text-[8px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ATS Progress
                </p>
                <div style={{ width: "100%", height: 60 }} className="min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart
                      data={trendData}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="#4F46E5"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor="#4F46E5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#4F46E5"
                        strokeWidth={1.5}
                        fill="url(#pg)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Score ring */}
              <div className="bg-white dark:bg-slate-950/80 rounded-xl p-2 border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center">
                <ScoreRing value={91} color="#4F46E5" size={52} />
                <p className="text-[8px] text-slate-500 dark:text-slate-400 mt-1">
                  Resume Score
                </p>
              </div>
            </div>

            {/* Recent jobs */}
            <div className="bg-white dark:bg-slate-950/80 rounded-xl p-2 border border-slate-100 dark:border-slate-850">
              <p className="text-[8px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recent Jobs
              </p>
              <div className="space-y-1">
                {[
                  {
                    co: "Stripe",
                    role: "Frontend Eng",
                    match: 91,
                    color: "#635BFF",
                  },
                  {
                    co: "Linear",
                    role: "Product Eng",
                    match: 87,
                    color: "#5E6AD2",
                  },
                ].map((j) => (
                  <button
                    key={j.co}
                    onClick={() => handleDeepAction(`${j.co} Match`)}
                    className="w-full flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 p-1 rounded transition-colors text-left cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0"
                      style={{ backgroundColor: j.color }}
                    >
                      {j.co[0]}
                    </div>
                    <span className="text-[8px] text-slate-700 dark:text-slate-300 flex-1 truncate">
                      {j.co} — {j.role}
                    </span>
                    <span className="text-[7px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-full">
                      {j.match}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge cards */}
      <button
        onClick={() => handleDeepAction("ATS Report")}
        className="absolute -left-8 top-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg px-3 py-2.5 flex items-center gap-2.5 animate-bounce text-left cursor-pointer hover:scale-105 transition-transform"
        style={{ animationDuration: "3s" }}
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800 dark:text-white">
            ATS Score: 94/100
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400">
            Stripe Resume Optimized
          </p>
        </div>
      </button>

      <button
        onClick={() => handleDeepAction("Interview Prep")}
        className="absolute -right-6 bottom-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg px-3 py-2.5 flex items-center gap-2.5 animate-bounce text-left cursor-pointer hover:scale-105 transition-transform"
        style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}
      >
        <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800 dark:text-white">
            AI Interview Ready
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400">
            14 questions prepared
          </p>
        </div>
      </button>

      <button
        onClick={() => handleDeepAction("Analytics")}
        className="absolute -right-4 top-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg px-3 py-2.5 flex items-center gap-2.5 animate-bounce text-left cursor-pointer hover:scale-105 transition-transform"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      >
        <div className="w-7 h-7 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800 dark:text-white">
            3× more interviews
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400">
            vs manual applications
          </p>
        </div>
      </button>
    </div>
  );
}
