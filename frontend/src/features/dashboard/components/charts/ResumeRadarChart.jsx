import { memo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import Skeleton from "../Skeleton";

const ResumeRadarChart = memo(({ loading, data }) => {
  const isDataEmpty =
    !data || data.length === 0 || data.every((d) => d.A === 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-foreground mb-0.5">Resume DNA</h3>
      <p className="text-xs text-muted-foreground mb-3">Skill distribution</p>
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : isDataEmpty ? (
        <div className="h-[190px] flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            Resume analysis will appear after your first generated resume.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={190}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="A"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

export default ResumeRadarChart;
