import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { trendData } from "../../../data/dashboardData";

export default function AtsTrendChart() {
    return (

        <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={trendData}>
                <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-lg)" }} labelStyle={{ color: "var(--color-foreground)" }} />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#sg)" dot={{ r: 3.5, fill: "var(--color-primary)", strokeWidth: 0 }} activeDot={{ r: 5, fill: "var(--color-primary)" }} />
            </AreaChart>
        </ResponsiveContainer>
    )
}