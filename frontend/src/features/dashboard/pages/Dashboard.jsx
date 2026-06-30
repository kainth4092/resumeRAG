import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import ActivityFeed from "../components/ActivityFeed";
import AtsTrendChart from "../components/charts/ATSTrendChart";
import ResumeRadarChart from "../components/charts/ResumeRadarChart";
import WeeklyActivityChart from "../components/charts/WeeklyActivityChart";
import RecruiterSimulation from "../components/RecruiterSimulation";
import { dashboardService } from "../services/dashboardService";
import { mapApiActivities } from "../data/dashboardData";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [trend, setTrend] = useState([]);
  const [radar, setRadar] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  const loadDashboardData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const localHour = new Date().getHours();
      const data = await dashboardService.getDashboardData(localHour);

      setGreeting(data.greeting || "");
      setTrend(data.score_trend || []);
      setRadar(data.resume_dna || []);
      setWeekly(data.weekly_activity || []);
      setActivityFeed(mapApiActivities(data.recent_activities));

    } catch (e) {
      console.error("Failed to load dashboard statistics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <DashboardHeader refreshing={refreshing} onRefresh={refresh} greeting={greeting} />


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-foreground">ATS Score Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {trend.length <= 1 ? "Historical progress" : `${trend.length} Resumes Trend`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {deltaText && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${deltaText.startsWith("+")
                    ? "text-emerald-500 bg-emerald-500/10"
                    : "text-amber-500 bg-amber-500/10"
                    }`}>
                    {deltaText}
                  </span>
                )}
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            <AtsTrendChart data={trend} />
          </div>

          <ResumeRadarChart loading={loading} data={radar} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <WeeklyActivityChart loading={loading} data={weekly} />
          <ActivityFeed loading={loading} activities={activityFeed} />
        </div>

        <RecruiterSimulation />
      </div>
    </div>
  );
}
