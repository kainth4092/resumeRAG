import { useState, useEffect } from "react";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import ResumeHealth from "../components/ResumeHealth";
import ActivityFeed from "../components/ActivityFeed";
import AISuggestions from "../components/AISuggestions";
import UpcomingTasks from "../components/UpcomingTasks";
import AtsTrendChart from "../components/charts/ATSTrendChart";
import ResumeRadarChart from "../components/charts/ResumeRadarChart";
import WeeklyActivityChart from "../components/charts/WeeklyActivityChart";
import RecruiterSimulation from "../components/RecruiterSimulation";
import { mapApiActivities } from "../data/dashboardData";
import { useAuth } from "../../auth/context/AuthContext";
import { getDashboardData } from "../services/dashboardService";
import DashboardSkeleton from "../../../components/loading/DashboardSkeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const cacheKey = user?.email ? `dashboard_data_${user.email}` : null;

  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      return !cached;
    }
    return true;
  });
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(() => {
    if (typeof window !== "undefined" && cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      try {
        return cached ? JSON.parse(cached) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const loadDashboardData = async (isRefresh = false) => {
    const key = user?.email ? `dashboard_data_${user.email}` : null;
    if (!isRefresh && (!key || !localStorage.getItem(key))) {
      setLoading(true);
    }
    setError(null);
    try {
      const localHour = new Date().getHours();
      const data = await dashboardService.getDashboardData(
        localHour,
        isRefresh,
      );
      setDashboardData(data);
      if (key) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to load dashboard statistics:", e);
      if (!dashboardData) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            "Failed to load dashboard statistics.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboardData();

        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error("Dashboard loading failed:", error);

        if (mounted) {
          setError(
            error?.response?.data?.detail || "Unable to load dashboard data.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  };

  if (error) {
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
            onClick={() => loadDashboardData()}
            className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm font-semibold shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const greeting = dashboardData?.greeting || "";
  const trend = dashboardData?.score_trend || [];
  const radar = dashboardData?.resume_dna || [];
  const weekly = dashboardData?.weekly_activity || [];
  const activityFeed = mapApiActivities(dashboardData?.recent_activities);
  const emptyStates = dashboardData?.empty_states || {
    no_resumes: trend.length === 0,
    no_jobs: true,
    no_interviews: true,
  };

  const getImprovementDelta = () => {
    if (trend.length < 2) return null;
    const firstScore = trend[0].score;
    const lastScore = trend[trend.length - 1].score;
    const diff = lastScore - firstScore;
    if (diff > 0) return `+${diff}pts overall`;
    if (diff < 0) return `${diff}pts overall`;
    return "No change";
  };

  const deltaText = getImprovementDelta();

  if (loading && !refreshing) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-full overflow-y-auto ">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <DashboardHeader
          refreshing={refreshing}
          onRefresh={refresh}
          greeting={greeting}
          stats={dashboardData}
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
            <ResumeHealth data={dashboardData} />
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

        {/* Third Row Grid: AI Copilot Suggestions & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AISuggestions data={dashboardData} />
          <UpcomingTasks data={dashboardData} />
        </div>

        {/* Bottom Banner Simulation */}
        <RecruiterSimulation noResumes={emptyStates.no_resumes} />
      </div>
    </div>
  );
}
