import { useState, useEffect } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatsGrid from "../../components/dashboard/StatsGrid";
import AtsTrendChart from "../../components/dashboard/charts/ATSTrendChart";
import ResumeRadarChart from "../../components/dashboard/charts/ResumeRadarChart";
import WeeklyActivityChart from "../../components/dashboard/charts/WeeklyActivityChart";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import RecruiterSimulation from "../../components/dashboard/RecruiterSimulation";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setLoading(false);
        setRefreshing(false);
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                <DashboardHeader
                    refreshing={refreshing}
                    onRefresh={refresh}
                />

                {/* <StatsGrid loading={loading} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    <AtsTrendChart />

                    <ResumeRadarChart loading={loading} />

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    <WeeklyActivityChart loading={loading} />

                    <ActivityFeed loading={loading} />

                </div>

                <RecruiterSimulation /> */}

            </div>
        </div>
    );
}