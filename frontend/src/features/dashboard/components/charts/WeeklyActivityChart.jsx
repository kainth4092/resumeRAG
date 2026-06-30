import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import Skeleton from "../Skeleton";

export default function WeeklyActivityChart({ loading, data }) {
    const isDataEmpty = !data || data.length === 0 || data.every(d => d.applied === 0 && d.interviews === 0);

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-foreground mb-0.5">Weekly Activity</h3>
            <p className="text-xs text-muted-foreground mb-4">Applications & interviews</p>
            {loading ? (
                <Skeleton className="h-36 w-full" />
            ) : isDataEmpty ? (
                <div className="h-[140px] flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground">
                        No activity this week.
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={data} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 11 }} />
                        <Bar dataKey="applied" name="Applied" fill="var(--color-primary)" radius={[3, 3, 0, 0]} opacity={0.7} />
                        <Bar dataKey="interviews" name="Interviews" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}