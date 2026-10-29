import { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import ResumeHealth from "../components/ResumeHealth";
import ActivityFeed from "../components/ActivityFeed";
import AISuggestions from "../components/AISuggestions";
import UpcomingTasks from "../components/UpcomingTasks";
import AtsTrendChart from "../components/charts/ATSTrendChart";
import ResumeRadarChart from "../components/charts/ResumeRadarChart";
import WeeklyActivityChart from "../components/charts/WeeklyActivityChart";
import { mapApiActivities } from "../data/dashboardData";
import { getDashboardData } from "../services/dashboardService";
import { listPipelineRuns } from "../../pipeline/services/pipelineService";
import DashboardSkeleton from "../../../components/loading/DashboardSkeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [pipelineRuns, setPipelineRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [result, runs] = await Promise.all([
        getDashboardData(),
        listPipelineRuns(4).catch(() => []),
      ]);
      setData(result);
      setPipelineRuns(runs || []);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      getDashboardData(),
      listPipelineRuns(4).catch(() => []),
    ])
      .then(([result, runs]) => {
        if (!active) return;
        setData(result);
        setPipelineRuns(runs || []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Dashboard fetch failed:", err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Unable to load dashboard data. Please try again."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error && !data) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Error Loading Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => fetchDashboard(false)}
            className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm font-semibold shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return <DashboardSkeleton />;
  }

  const greeting = data?.greeting || "";
  const trend = data?.score_trend || [];
  const radar = data?.resume_dna || [];
  const weekly = data?.weekly_activity || [];
  const activityFeed = mapApiActivities(data?.recent_activities);

  const getImprovementDelta = () => {
    if (!trend || trend.length < 2) return null;
    const firstScore = trend[0].score;
    const lastScore = trend[trend.length - 1].score;
    const diff = lastScore - firstScore;
    if (diff > 0) return `+${diff}pts overall`;
    if (diff < 0) return `${diff}pts overall`;
    return "No change";
  };

  const deltaText = getImprovementDelta();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={() => fetchDashboard(true)}
          greeting={greeting}
          stats={data}
        />

        {/* First Row Grid: ATS Trend and Resume Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  ATS Score Trend
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {trend.length <= 1
                    ? "Historical progress"
                    : `${trend.length} Resumes Trend`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {deltaText && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      deltaText.startsWith("+")
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-amber-500 bg-amber-500/10"
                    }`}
                  >
                    {deltaText}
                  </span>
                )}
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <AtsTrendChart data={trend} />
            </div>
          </div>

          <div className="col-span-1">
            <ResumeHealth data={data} />
          </div>
        </div>

        {/* Second Row Grid: Weekly Activity, Skill Radar, Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <WeeklyActivityChart loading={loading} data={weekly} />
          </div>
          <div>
            <ResumeRadarChart loading={loading} data={radar} />
          </div>
          <div>
            <ActivityFeed loading={loading} activities={activityFeed} />
          </div>
        </div>

        {/* Third Row Grid: AI Suggestions & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AISuggestions data={data} />
          <UpcomingTasks data={data} />
        </div>

        {/* Recent AI Pipeline Runs */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Recent AI Pipeline Runs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Resume tailoring, job matches, interview prep, and roadmaps
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/pipeline")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Start New Run <ArrowRight size={13} />
            </button>
          </div>

          {pipelineRuns.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-3">
                No pipeline runs yet. Tailor your resume to any job description in minutes.
              </p>
              <button
                onClick={() => navigate("/pipeline")}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
              >
                Launch Pipeline
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pipelineRuns.map((run) => {
                const isCompleted = run.status === "completed";
                const isPartial = run.status === "partial";
                const isRunning = run.status === "running";
                const isFailed = run.status === "failed";
                return (
                  <div
                    key={run.id}
                    onClick={() => navigate(`/pipeline/${run.id}`)}
                    className="p-3.5 rounded-xl border border-border hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : isPartial
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : isRunning
                              ? "bg-primary/10 text-primary border border-primary/20 animate-pulse"
                              : isFailed
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {run.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {run.created_at ? new Date(run.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        Run #{run.id.slice(0, 8)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Template: <span className="capitalize">{run.template || "modern"}</span>
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-primary font-medium">
                      <span>View Results</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
