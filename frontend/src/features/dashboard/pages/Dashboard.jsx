import { useState, useEffect, useCallback } from "react";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
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
import DashboardSkeleton from "../../../components/loading/DashboardSkeleton";

export default function Dashboard() {
  const [data, setData] = useState(null);
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
      const result = await getDashboardData();
      setData(result);
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
    fetchDashboard(false);
  }, [fetchDashboard]);

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
      </div>
    </div>
  );
}
