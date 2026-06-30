import { Clock } from "lucide-react";
import Skeleton from "./Skeleton";
import { activities as defaultActivities } from "../data/dashboardData";
import { useNavigate } from "react-router-dom";

export default function ActivityFeed({ loading, activities }) {
    const navigate = useNavigate();
    const feed = activities || defaultActivities;

    return (
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Recent Activity</h3>
                <button onClick={() => navigate("/resumes")} className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">View all →</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-52">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-2.5 w-48" />
                            </div>
                        </div>
                    ))
                    : feed.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 group hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-xl transition-colors cursor-pointer">
                            <div className={`w-8 h-8 rounded-xl ${a.color} flex items-center justify-center shrink-0 mt-0.5`}>
                                <a.icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{a.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{a.body}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                <Clock size={10} />{a.time}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}