import { useState } from "react";
import {
  X,
  TrendingUp,
  BarChart3,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../features/dashboard/services/dashboardService";

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardData();
      setData(res);
    } catch (err) {
      console.error("Failed to load quick stats:", err);
      setError("Unable to load live stats.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    loadStats();
  };

  const stats = data?.stats_summary || {
    resumes_count: 0,
    ats_score: 0,
    ats_trend: "stable",
    interviews_count: 0,
    jobs_count: 0,
  };

  const insights = data?.resume_insights;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!open && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-4 py-3 bg-card border border-border shadow-lg hover:shadow-xl rounded-full text-foreground hover:bg-muted/60 transition-all cursor-pointer font-semibold text-xs group"
          title="Open Quick Stats"
        >
          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 size={14} />
          </div>
          <span>Quick Stats</span>
        </button>
      )}

      {open && (
        <div className="w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 size={15} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">
                  Quick Stats & Career Overview
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Real-time pipeline metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadStats}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Refresh stats"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[460px] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] font-medium mb-1">
                  <span>ATS Score</span>
                  <TrendingUp size={12} className="text-emerald-500" />
                </div>
                <div className="text-lg font-extrabold text-foreground">
                  {stats.ats_score}
                  <span className="text-xs text-muted-foreground font-normal">/100</span>
                </div>
                <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
                  {stats.ats_trend}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] font-medium mb-1">
                  <span>Resumes</span>
                  <FileText size={12} className="text-primary" />
                </div>
                <div className="text-lg font-extrabold text-foreground">
                  {stats.resumes_count}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Created & uploaded
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] font-medium mb-1">
                  <span>Tracked Jobs</span>
                  <Briefcase size={12} className="text-amber-500" />
                </div>
                <div className="text-lg font-extrabold text-foreground">
                  {stats.jobs_count || data?.total_tracked_jobs || 0}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  In job tracker
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] font-medium mb-1">
                  <span>Interviews</span>
                  <CheckCircle2 size={12} className="text-indigo-500" />
                </div>
                <div className="text-lg font-extrabold text-foreground">
                  {stats.interviews_count || data?.total_interviews || 0}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Prep sessions
                </div>
              </div>
            </div>

            {/* Skills Insight */}
            {insights && (
              <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="text-[11px] font-bold text-foreground">
                  Detected Core Skills
                </div>
                <div className="flex flex-wrap gap-1">
                  {insights.top_skills && insights.top_skills.length > 0 ? (
                    insights.top_skills.slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      No skills extracted yet.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="space-y-1 pt-1 border-t border-border">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span>View Full Dashboard</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/tracker");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span>Browse & Track Jobs</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/interview");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span>Prepare for Interviews</span>
                <ArrowRight size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
