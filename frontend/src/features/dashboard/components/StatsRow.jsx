import { useState, useEffect, useRef } from "react";
import { Star, FileText, Briefcase, TrendingUp } from "lucide-react";

function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    // Reset if target changes
    done.current = false;
  }, [to]);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);

  return (
    <span>
      {val}
      {suffix}
    </span>
  );
}

export default function StatsRow({ data }) {
  const statsSummary = data?.stats_summary;
  const atsScore = statsSummary?.ats_score || 0;
  const resumesCount = statsSummary?.resumes_count || 0;
  const trackedJobs = statsSummary?.jobs_count || 0;
  const interviewReadiness = atsScore ? Math.round(atsScore * 0.9) : 0;

  const stats = [
    {
      label: "ATS Average Score",
      val: atsScore,
      suffix: "/100",
      trend: statsSummary?.ats_trend || "First version",
      icon: Star,
      color: "text-primary dark:text-indigo-400",
      bg: "bg-primary/10 dark:bg-primary/20",
    },
    {
      label: "Resumes Generated",
      val: resumesCount,
      suffix: "",
      trend: statsSummary?.resumes_trend || "0 this month",
      icon: FileText,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/30",
    },
    {
      label: "Applications Tracked",
      val: trackedJobs,
      suffix: "",
      trend: statsSummary?.jobs_trend || "0 this week",
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30",
    },
    {
      label: "Interview Readiness",
      val: interviewReadiness,
      suffix: "%",
      trend: statsSummary?.interviews_trend || "0 this week",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((card) => (
        <div
          key={card.label}
          className="relative bg-card border border-border p-5 rounded-2xl flex flex-col justify-between hover:shadow-md hover:border-muted-foreground/30 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-muted-foreground leading-snug">
              {card.label}
            </span>
            <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon size={15} className={card.color} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground tracking-tight flex items-baseline gap-1">
              <Counter to={card.val} suffix={card.suffix} />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              <span className="text-emerald-500 font-bold">{card.trend}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
