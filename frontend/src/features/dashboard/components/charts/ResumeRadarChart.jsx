import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import Skeleton from "../Skeleton";
import { radarData } from "../../data/dashboardData";

export default function ResumeRadarChart({ loading }) {
    return (

        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-foreground mb-0.5">Resume DNA</h3>
            <p className="text-xs text-muted-foreground mb-3">Skill distribution</p>
            {loading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={190}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}